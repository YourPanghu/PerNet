package com.pernet.blog.controller;

import com.pernet.blog.dto.ApiResponse;
import com.pernet.blog.dto.BlogProfileResponse;
import com.pernet.blog.service.BlogProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class BlogProfileController {

    private final BlogProfileService profileService;

    @GetMapping
    public ResponseEntity<ApiResponse<BlogProfileResponse>> getProfile() {
        BlogProfileResponse profile = profileService.getProfile();
        return ResponseEntity.ok(ApiResponse.success(profile));
    }
}
