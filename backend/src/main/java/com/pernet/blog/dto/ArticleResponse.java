package com.pernet.blog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticleResponse {
    private Long id;
    private String title;
    private String content;
    private String summary;
    private String coverImage;
    private String status;
    private Long viewCount;
    private Long categoryId;
    private String categoryName;
    private String authorName;
    private List<Long> tagIds;
    private List<String> tagNames;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
