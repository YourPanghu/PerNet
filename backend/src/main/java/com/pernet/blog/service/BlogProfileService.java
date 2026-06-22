package com.pernet.blog.service;

import com.pernet.blog.dto.BlogProfileResponse;
import com.pernet.blog.dto.BlogProfileRequest;
import com.pernet.blog.entity.BlogProfile;
import com.pernet.blog.repository.BlogProfileRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BlogProfileService {

    private final BlogProfileRepository profileRepository;
    private final RedisService redisService;

    public BlogProfileResponse getProfile() {
        // Try Redis cache first
        return redisService.getCachedProfile(BlogProfileResponse.class)
                .orElseGet(() -> {
                    BlogProfile profile = profileRepository.findAll().stream()
                            .findFirst()
                            .orElseThrow(() -> new EntityNotFoundException("Profile not found"));
                    BlogProfileResponse response = toResponse(profile);
                    redisService.cacheProfile(response);
                    return response;
                });
    }

    @Transactional
    public BlogProfileResponse updateProfile(BlogProfileRequest request) {
        BlogProfile profile = profileRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> {
                    BlogProfile p = BlogProfile.builder().build();
                    return profileRepository.save(p);
                });

        if (request.getNickname() != null) profile.setNickname(request.getNickname());
        if (request.getAvatar() != null) profile.setAvatar(request.getAvatar());
        if (request.getCoverImage() != null) profile.setCoverImage(request.getCoverImage());
        if (request.getBio() != null) profile.setBio(request.getBio());

        BlogProfileResponse response = toResponse(profileRepository.save(profile));
        // Refresh cache
        redisService.cacheProfile(response);
        return response;
    }

    private BlogProfileResponse toResponse(BlogProfile profile) {
        return BlogProfileResponse.builder()
                .id(profile.getId())
                .nickname(profile.getNickname())
                .avatar(profile.getAvatar())
                .coverImage(profile.getCoverImage())
                .bio(profile.getBio())
                .build();
    }
}
