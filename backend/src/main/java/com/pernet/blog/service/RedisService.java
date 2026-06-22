package com.pernet.blog.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisService {

    private static final String KEY_PREFIX_TOKEN = "token:";
    private static final String KEY_PREFIX_CACHE = "cache:";
    private static final String KEY_PREFIX_VIEW = "view:";

    private final RedisTemplate<String, Object> redisTemplate;
    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.cache.profile-ttl:1800000}")
    private long profileTtl;

    @Value("${app.cache.categories-ttl:600000}")
    private long categoriesTtl;

    @Value("${app.cache.tags-ttl:600000}")
    private long tagsTtl;

    @Value("${app.cache.article-ttl:300000}")
    private long articleTtl;

    // ==================== Generic Cache Operations ====================

    public <T> Optional<T> get(String key, Class<T> type) {
        try {
            Object value = redisTemplate.opsForValue().get(key);
            if (value == null) return Optional.empty();
            return Optional.of(objectMapper.convertValue(value, type));
        } catch (Exception e) {
            log.warn("Redis get failed for key {}: {}", key, e.getMessage());
            return Optional.empty();
        }
    }

    public void set(String key, Object value, long ttlMillis) {
        try {
            redisTemplate.opsForValue().set(key, value, ttlMillis, TimeUnit.MILLISECONDS);
        } catch (Exception e) {
            log.warn("Redis set failed for key {}: {}", key, e.getMessage());
        }
    }

    public void delete(String key) {
        try {
            redisTemplate.delete(key);
        } catch (Exception e) {
            log.warn("Redis delete failed for key {}: {}", key, e.getMessage());
        }
    }

    public boolean hasKey(String key) {
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(key));
        } catch (Exception e) {
            log.warn("Redis hasKey failed for key {}: {}", key, e.getMessage());
            return false;
        }
    }

    public void deleteByPattern(String pattern) {
        try {
            Set<String> keys = redisTemplate.keys(pattern);
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
        } catch (Exception e) {
            log.warn("Redis deleteByPattern failed for pattern {}: {}", pattern, e.getMessage());
        }
    }

    // ==================== Token Whitelist ====================

    public void cacheToken(String token, String username, long ttlMillis) {
        String key = KEY_PREFIX_TOKEN + token;
        set(key, username, ttlMillis);
    }

    public boolean tokenExists(String token) {
        String key = KEY_PREFIX_TOKEN + token;
        return hasKey(key);
    }

    public void deleteToken(String token) {
        String key = KEY_PREFIX_TOKEN + token;
        delete(key);
    }

    // ==================== Profile Cache ====================

    public <T> Optional<T> getCachedProfile(Class<T> type) {
        return get(KEY_PREFIX_CACHE + "profile", type);
    }

    public void cacheProfile(Object profile) {
        set(KEY_PREFIX_CACHE + "profile", profile, profileTtl);
    }

    // ==================== Categories Cache ====================

    @SuppressWarnings("unchecked")
    public <T> Optional<List<T>> getCachedCategories(Class<T> type) {
        return get(KEY_PREFIX_CACHE + "categories", (Class<List<T>>) (Class<?>) List.class)
                .map(list -> list.stream()
                        .map(item -> objectMapper.convertValue(item, type))
                        .collect(Collectors.toList()));
    }

    public void cacheCategories(Object categories) {
        set(KEY_PREFIX_CACHE + "categories", categories, categoriesTtl);
    }

    public void invalidateCategories() {
        delete(KEY_PREFIX_CACHE + "categories");
    }

    // ==================== Tags Cache ====================

    @SuppressWarnings("unchecked")
    public <T> Optional<List<T>> getCachedTags(Class<T> type) {
        return get(KEY_PREFIX_CACHE + "tags", (Class<List<T>>) (Class<?>) List.class)
                .map(list -> list.stream()
                        .map(item -> objectMapper.convertValue(item, type))
                        .collect(Collectors.toList()));
    }

    public void cacheTags(Object tags) {
        set(KEY_PREFIX_CACHE + "tags", tags, tagsTtl);
    }

    public void invalidateTags() {
        delete(KEY_PREFIX_CACHE + "tags");
    }

    // ==================== Article Cache ====================

    public <T> Optional<T> getCachedArticle(Long id, Class<T> type) {
        return get(KEY_PREFIX_CACHE + "article:" + id, type);
    }

    public void cacheArticle(Long id, Object article) {
        set(KEY_PREFIX_CACHE + "article:" + id, article, articleTtl);
    }

    public void invalidateArticle(Long id) {
        delete(KEY_PREFIX_CACHE + "article:" + id);
    }

    // ==================== View Count ====================

    public long incrementViewCount(Long articleId) {
        String key = KEY_PREFIX_VIEW + articleId;
        try {
            Long count = stringRedisTemplate.opsForValue().increment(key);
            return count != null ? count : 0L;
        } catch (Exception e) {
            log.warn("Redis incrementViewCount failed for article {}: {}", articleId, e.getMessage());
            return 0L;
        }
    }

    public long getViewCount(Long articleId) {
        String key = KEY_PREFIX_VIEW + articleId;
        try {
            String value = stringRedisTemplate.opsForValue().get(key);
            return value != null ? Long.parseLong(value) : 0L;
        } catch (Exception e) {
            log.warn("Redis getViewCount failed for article {}: {}", articleId, e.getMessage());
            return 0L;
        }
    }

    /**
     * Sync all Redis view counts to DB and return the map.
     * Does NOT delete the Redis keys — they continue accumulating.
     */
    public Map<Long, Long> getAndPersistViewCounts() {
        Map<Long, Long> counts = new HashMap<>();
        try {
            Set<String> keys = stringRedisTemplate.keys(KEY_PREFIX_VIEW + "*");
            if (keys == null || keys.isEmpty()) return counts;

            for (String key : keys) {
                try {
                    Long articleId = Long.parseLong(key.substring(KEY_PREFIX_VIEW.length()));
                    String value = stringRedisTemplate.opsForValue().get(key);
                    if (value != null) {
                        long count = Long.parseLong(value);
                        counts.put(articleId, count);
                    }
                } catch (Exception e) {
                    log.warn("Error reading view count for key {}: {}", key, e.getMessage());
                }
            }
        } catch (Exception e) {
            log.warn("Redis getAndPersistViewCounts failed: {}", e.getMessage());
        }
        return counts;
    }

    // ==================== Admin: Clear All Cache ====================

    public void clearAllCache() {
        deleteByPattern(KEY_PREFIX_CACHE + "*");
        log.info("All caches cleared");
    }

    public void clearCacheByKey(String cacheKey) {
        delete(KEY_PREFIX_CACHE + cacheKey);
        log.info("Cache cleared for key: {}", cacheKey);
    }
}
