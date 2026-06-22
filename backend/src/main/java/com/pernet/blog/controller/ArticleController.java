package com.pernet.blog.controller;

import com.pernet.blog.dto.ApiResponse;
import com.pernet.blog.dto.ArticleResponse;
import com.pernet.blog.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ArticleResponse>>> getArticles(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long tagId) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ArticleResponse> articles;
        if (tagId != null) {
            articles = articleService.getPublishedArticlesByTag(tagId, pageable);
        } else if (categoryId != null) {
            articles = articleService.getPublishedArticlesByCategory(categoryId, pageable);
        } else {
            articles = articleService.getPublishedArticles(pageable);
        }
        return ResponseEntity.ok(ApiResponse.success(articles));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ArticleResponse>> getArticle(@PathVariable Long id) {
        ArticleResponse article = articleService.getPublishedArticle(id);
        return ResponseEntity.ok(ApiResponse.success(article));
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<ApiResponse<ArticleResponse>> incrementView(@PathVariable Long id) {
        ArticleResponse article = articleService.getArticleAndIncrementView(id);
        return ResponseEntity.ok(ApiResponse.success(article));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<ArticleResponse>>> searchArticles(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long tagId) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ArticleResponse> articles;
        if (tagId != null) {
            articles = articleService.searchPublishedByTag(keyword, tagId, pageable);
        } else if (categoryId != null) {
            articles = articleService.searchPublishedByCategory(keyword, categoryId, pageable);
        } else {
            articles = articleService.searchPublished(keyword, pageable);
        }
        return ResponseEntity.ok(ApiResponse.success(articles));
    }
}
