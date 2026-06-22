package com.pernet.blog.controller;

import com.pernet.blog.dto.ApiResponse;
import com.pernet.blog.service.RedisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/cache")
@RequiredArgsConstructor
public class AdminCacheController {

    private final RedisService redisService;

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearAllCache() {
        redisService.clearAllCache();
        return ResponseEntity.ok(ApiResponse.success("All caches cleared", null));
    }

    @DeleteMapping("/{key}")
    public ResponseEntity<ApiResponse<Void>> clearCacheByKey(@PathVariable String key) {
        redisService.clearCacheByKey(key);
        return ResponseEntity.ok(ApiResponse.success("Cache cleared: " + key, null));
    }
}
