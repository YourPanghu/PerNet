package com.pernet.blog.repository;

import com.pernet.blog.entity.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long>, JpaSpecificationExecutor<Article> {

    Page<Article> findByStatusOrderByCreatedAtDesc(Article.ArticleStatus status, Pageable pageable);

    Page<Article> findByStatusAndCategoryIdOrderByCreatedAtDesc(
            Article.ArticleStatus status, Long categoryId, Pageable pageable);

    Optional<Article> findByIdAndStatus(Long id, Article.ArticleStatus status);

    Page<Article> findByStatusAndTags_IdOrderByCreatedAtDesc(
            Article.ArticleStatus status, Long tagId, Pageable pageable);

    @Query("SELECT a FROM Article a WHERE a.status = 'PUBLISHED' AND " +
           "(LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(a.content) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Article> searchPublished(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT a FROM Article a WHERE a.status = 'PUBLISHED' AND a.category.id = :categoryId AND " +
           "(LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(a.content) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Article> searchPublishedByCategory(@Param("keyword") String keyword,
                                             @Param("categoryId") Long categoryId,
                                             Pageable pageable);

    @Query("SELECT DISTINCT a FROM Article a JOIN a.tags t WHERE a.status = 'PUBLISHED' AND t.id = :tagId AND " +
           "(LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(a.content) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Article> searchPublishedByTag(@Param("keyword") String keyword,
                                        @Param("tagId") Long tagId,
                                        Pageable pageable);

    @Query("SELECT a FROM Article a WHERE " +
           "(LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(a.content) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Article> searchAll(@Param("keyword") String keyword, Pageable pageable);

    long countByCategoryId(Long categoryId);

    long countByCategoryIdAndStatus(Long categoryId, Article.ArticleStatus status);

    List<Article> findByCategoryId(Long categoryId);

    @Modifying
    @Query("UPDATE Article a SET a.viewCount = a.viewCount + 1 WHERE a.id = :id")
    void incrementViewCount(@Param("id") Long id);
}
