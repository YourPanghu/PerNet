package com.pernet.blog.scheduler;

import com.pernet.blog.entity.Article;
import com.pernet.blog.repository.ArticleRepository;
import com.pernet.blog.service.RedisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class ViewCountSyncScheduler {

    private final RedisService redisService;
    private final ArticleRepository articleRepository;

    @Scheduled(fixedRate = 5 * 60 * 1000)
    @Transactional
    public void syncViewCounts() {
        Map<Long, Long> counts = redisService.getAndPersistViewCounts();
        if (counts.isEmpty()) return;

        int updated = 0;
        for (Map.Entry<Long, Long> entry : counts.entrySet()) {
            Long articleId = entry.getKey();
            Long redisCount = entry.getValue();
            articleRepository.findById(articleId).ifPresent(article -> {
                if (redisCount > article.getViewCount()) {
                    article.setViewCount(redisCount);
                    articleRepository.save(article);
                }
            });
            updated++;
        }
        if (updated > 0) {
            log.info("Synced view counts for {} articles from Redis to DB", updated);
        }
    }
}
