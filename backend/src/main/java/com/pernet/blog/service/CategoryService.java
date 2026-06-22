package com.pernet.blog.service;

import com.pernet.blog.dto.CategoryRequest;
import com.pernet.blog.dto.CategoryResponse;
import com.pernet.blog.entity.Category;
import com.pernet.blog.entity.Article;
import com.pernet.blog.repository.CategoryRepository;
import com.pernet.blog.repository.ArticleRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ArticleRepository articleRepository;
    private final RedisService redisService;

    public List<CategoryResponse> getAllCategories() {
        return redisService.getCachedCategories(CategoryResponse.class)
                .orElseGet(() -> {
                    List<CategoryResponse> categories = categoryRepository.findAll().stream()
                            .map(this::toResponse)
                            .collect(Collectors.toList());
                    redisService.cacheCategories(categories);
                    return categories;
                });
    }

    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));
        return toResponse(category);
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
        CategoryResponse response = toResponse(categoryRepository.save(category));
        redisService.invalidateCategories();
        return response;
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        CategoryResponse response = toResponse(categoryRepository.save(category));
        redisService.invalidateCategories();
        return response;
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));
        // 把该分类下的文章分类置空
        List<Article> articles = articleRepository.findByCategoryId(id);
        for (Article article : articles) {
            article.setCategory(null);
        }
        articleRepository.saveAll(articles);
        categoryRepository.delete(category);
        redisService.invalidateCategories();
    }

    private CategoryResponse toResponse(Category category) {
        long articleCount = articleRepository.countByCategoryIdAndStatus(
                category.getId(), Article.ArticleStatus.PUBLISHED);
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .articleCount(articleCount)
                .build();
    }
}
