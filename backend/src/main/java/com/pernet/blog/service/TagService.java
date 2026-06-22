package com.pernet.blog.service;

import com.pernet.blog.dto.TagRequest;
import com.pernet.blog.dto.TagResponse;
import com.pernet.blog.entity.Article;
import com.pernet.blog.entity.Tag;
import com.pernet.blog.repository.ArticleRepository;
import com.pernet.blog.repository.TagRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TagService {

    private final TagRepository tagRepository;
    private final ArticleRepository articleRepository;
    private final RedisService redisService;

    public List<TagResponse> getAllTags() {
        return redisService.getCachedTags(TagResponse.class)
                .orElseGet(() -> {
                    List<TagResponse> tags = tagRepository.findAll().stream()
                            .map(this::toResponse)
                            .collect(Collectors.toList());
                    redisService.cacheTags(tags);
                    return tags;
                });
    }

    public TagResponse getTagById(Long id) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tag not found"));
        return toResponse(tag);
    }

    @Transactional
    public TagResponse createTag(TagRequest request) {
        Tag tag = Tag.builder()
                .name(request.getName())
                .build();
        TagResponse response = toResponse(tagRepository.save(tag));
        redisService.invalidateTags();
        return response;
    }

    @Transactional
    public TagResponse updateTag(Long id, TagRequest request) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tag not found"));
        tag.setName(request.getName());
        TagResponse response = toResponse(tagRepository.save(tag));
        redisService.invalidateTags();
        return response;
    }

    @Transactional
    public void deleteTag(Long id) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tag not found"));
        // Remove this tag from all associated articles
        for (Article article : tag.getArticles()) {
            article.getTags().remove(tag);
        }
        articleRepository.saveAll(tag.getArticles());
        tagRepository.delete(tag);
        redisService.invalidateTags();
    }

    private TagResponse toResponse(Tag tag) {
        long articleCount = tag.getArticles().stream()
                .filter(a -> a.getStatus() == Article.ArticleStatus.PUBLISHED)
                .count();
        return TagResponse.builder()
                .id(tag.getId())
                .name(tag.getName())
                .articleCount(articleCount)
                .build();
    }
}
