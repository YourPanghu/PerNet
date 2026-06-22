package com.pernet.blog.controller;

import com.pernet.blog.dto.ApiResponse;
import com.pernet.blog.dto.BlogProfileRequest;
import com.pernet.blog.dto.BlogProfileResponse;
import com.pernet.blog.service.BlogProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/profile")
@RequiredArgsConstructor
public class AdminBlogProfileController {

    private final BlogProfileService profileService;

    @PutMapping
    public ResponseEntity<ApiResponse<BlogProfileResponse>> updateProfile(
            @Valid @RequestBody BlogProfileRequest request) {
        BlogProfileResponse profile = profileService.updateProfile(request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", profile));
    }
}
