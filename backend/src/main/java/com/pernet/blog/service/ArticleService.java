package com.pernet.blog.service;

import com.pernet.blog.dto.ArticleRequest;
import com.pernet.blog.dto.ArticleResponse;
import com.pernet.blog.entity.AdminUser;
import com.pernet.blog.entity.Article;
import com.pernet.blog.entity.BlogProfile;
import com.pernet.blog.entity.Category;
import com.pernet.blog.entity.Tag;
import com.pernet.blog.repository.ArticleRepository;
import com.pernet.blog.repository.BlogProfileRepository;
import com.pernet.blog.repository.CategoryRepository;
import com.pernet.blog.repository.TagRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final BlogProfileRepository profileRepository;
    private final RedisService redisService;

    public Page<ArticleResponse> getPublishedArticles(Pageable pageable) {
        return articleRepository.findByStatusOrderByCreatedAtDesc(Article.ArticleStatus.PUBLISHED, pageable)
                .map(this::toResponse);
    }

    public Page<ArticleResponse> getPublishedArticlesByCategory(Long categoryId, Pageable pageable) {
        return articleRepository.findByStatusAndCategoryIdOrderByCreatedAtDesc(
                        Article.ArticleStatus.PUBLISHED, categoryId, pageable)
                .map(this::toResponse);
    }

    public Page<ArticleResponse> getPublishedArticlesByTag(Long tagId, Pageable pageable) {
        return articleRepository.findByStatusAndTags_IdOrderByCreatedAtDesc(
                        Article.ArticleStatus.PUBLISHED, tagId, pageable)
                .map(this::toResponse);
    }

    public ArticleResponse getPublishedArticle(Long id) {
        // Try Redis cache first
        return redisService.getCachedArticle(id, ArticleResponse.class)
                .orElseGet(() -> {
                    Article article = articleRepository.findByIdAndStatus(id, Article.ArticleStatus.PUBLISHED)
                            .orElseThrow(() -> new EntityNotFoundException("Article not found"));
                    ArticleResponse response = toResponse(article);
                    redisService.cacheArticle(id, response);
                    return response;
                });
    }

    @Transactional
    public ArticleResponse getArticleAndIncrementView(Long id) {
        Article article = articleRepository.findByIdAndStatus(id, Article.ArticleStatus.PUBLISHED)
                .orElseThrow(() -> new EntityNotFoundException("Article not found"));
        // Use Redis atomic counter for view count
        long newCount = redisService.incrementViewCount(id);
        article.setViewCount(newCount);
        ArticleResponse response = toResponse(article);
        // Refresh article cache with updated view count
        redisService.cacheArticle(id, response);
        return response;
    }

    public Page<ArticleResponse> searchPublished(String keyword, Pageable pageable) {
        return articleRepository.searchPublished(keyword, pageable)
                .map(this::toResponse);
    }

    public Page<ArticleResponse> searchPublishedByCategory(String keyword, Long categoryId, Pageable pageable) {
        return articleRepository.searchPublishedByCategory(keyword, categoryId, pageable)
                .map(this::toResponse);
    }

    public Page<ArticleResponse> searchPublishedByTag(String keyword, Long tagId, Pageable pageable) {
        return articleRepository.searchPublishedByTag(keyword, tagId, pageable)
                .map(this::toResponse);
    }

    public Page<ArticleResponse> getAllArticles(Pageable pageable) {
        return articleRepository.findAll(pageable)
                .map(this::toResponse);
    }

    public Page<ArticleResponse> searchAll(String keyword, Pageable pageable) {
        return articleRepository.searchAll(keyword, pageable)
                .map(this::toResponse);
    }

    public ArticleResponse getArticleById(Long id) {
        return redisService.getCachedArticle(id, ArticleResponse.class)
                .orElseGet(() -> {
                    Article article = articleRepository.findById(id)
                            .orElseThrow(() -> new EntityNotFoundException("Article not found"));
                    ArticleResponse response = toResponse(article);
                    redisService.cacheArticle(id, response);
                    return response;
                });
    }

    @Transactional
    public ArticleResponse createArticle(ArticleRequest request, AdminUser author) {
        Article.ArticleStatus status;
        try {
            status = Article.ArticleStatus.valueOf(request.getStatus());
        } catch (IllegalArgumentException | NullPointerException e) {
            status = Article.ArticleStatus.PUBLISHED;
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new EntityNotFoundException("Category not found"));
        }

        List<Tag> tags = resolveTags(request.getTagIds());

        Article article = Article.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .summary(request.getSummary())
                .coverImage(request.getCoverImage())
                .status(status)
                .category(category)
                .tags(tags)
                .author(author)
                .build();

        ArticleResponse response = toResponse(articleRepository.save(article));
        redisService.invalidateArticle(response.getId());
        redisService.invalidateTags();
        redisService.invalidateCategories();
        return response;
    }

    @Transactional
    public ArticleResponse updateArticle(Long id, ArticleRequest request) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Article not found"));

        article.setTitle(request.getTitle());
        article.setContent(request.getContent());
        article.setSummary(request.getSummary());
        article.setCoverImage(request.getCoverImage());

        if (request.getStatus() != null) {
            try {
                article.setStatus(Article.ArticleStatus.valueOf(request.getStatus()));
            } catch (IllegalArgumentException ignored) {
            }
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new EntityNotFoundException("Category not found"));
            article.setCategory(category);
        } else {
            article.setCategory(null);
        }

        if (request.getTagIds() != null) {
            List<Tag> tags = resolveTags(request.getTagIds());
            article.setTags(tags);
        }

        ArticleResponse response = toResponse(articleRepository.save(article));
        redisService.invalidateArticle(response.getId());
        redisService.invalidateTags();
        redisService.invalidateCategories();
        return response;
    }

    @Transactional
    public void deleteArticle(Long id) {
        if (!articleRepository.existsById(id)) {
            throw new EntityNotFoundException("Article not found");
        }
        articleRepository.deleteById(id);
        redisService.invalidateArticle(id);
        redisService.invalidateTags();
        redisService.invalidateCategories();
    }

    private List<Tag> resolveTags(List<Long> tagIds) {
        if (tagIds == null || tagIds.isEmpty()) {
            return new ArrayList<>();
        }
        return tagIds.stream()
                .map(tagId -> tagRepository.findById(tagId)
                        .orElseThrow(() -> new EntityNotFoundException("Tag not found: " + tagId)))
                .collect(Collectors.toList());
    }

    private String getBlogProfileNickname() {
        return profileRepository.findAll().stream()
                .findFirst()
                .map(profile -> profile.getNickname() != null ? profile.getNickname() : "博主")
                .orElse("博主");
    }

    private ArticleResponse toResponse(Article article) {
        List<Long> tagIds = article.getTags() != null ?
                article.getTags().stream().map(Tag::getId).collect(Collectors.toList()) :
                new ArrayList<>();
        List<String> tagNames = article.getTags() != null ?
                article.getTags().stream().map(Tag::getName).collect(Collectors.toList()) :
                new ArrayList<>();

        // Use Redis view count if available, fallback to DB value
        long viewCount = redisService.getViewCount(article.getId());
        if (viewCount < article.getViewCount()) {
            viewCount = article.getViewCount();
        }

        return ArticleResponse.builder()
                .id(article.getId())
                .title(article.getTitle())
                .content(article.getContent())
                .summary(article.getSummary())
                .coverImage(article.getCoverImage())
                .status(article.getStatus().name())
                .viewCount(viewCount)
                .categoryId(article.getCategory() != null ? article.getCategory().getId() : null)
                .categoryName(article.getCategory() != null ? article.getCategory().getName() : null)
                .authorName(getBlogProfileNickname())
                .tagIds(tagIds)
                .tagNames(tagNames)
                .createdAt(article.getCreatedAt())
                .updatedAt(article.getUpdatedAt())
                .build();
    }
}
