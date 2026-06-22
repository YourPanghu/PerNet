package com.pernet.blog.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BlogProfileRequest {

    @Size(max = 50, message = "Nickname must be at most 50 characters")
    private String nickname;

    @Size(max = 500, message = "Avatar URL must be at most 500 characters")
    private String avatar;

    @Size(max = 500, message = "Cover image URL must be at most 500 characters")
    private String coverImage;

    @Size(max = 255, message = "Bio must be at most 255 characters")
    private String bio;
}
