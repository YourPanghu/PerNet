package com.pernet.blog.controller;

import com.pernet.blog.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/admin")
public class FileUploadController {

    @Value("${app.upload.path:${user.dir}/uploads}")
    private String uploadDir;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadFile(
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(400, "File is empty"));
            }

            String originalName = file.getOriginalFilename();
            String extension = "";
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;

            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(filename);
            file.transferTo(filePath.toFile());

            String url = "/api/uploads/" + filename;
            log.info("File uploaded: {} -> {}", originalName, url);

            Map<String, String> result = Map.of("url", url, "filename", filename);
            return ResponseEntity.ok(ApiResponse.success("Upload successful", result));
        } catch (IOException e) {
            log.error("Upload failed", e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error(500, "Upload failed: " + e.getMessage()));
        }
    }
}
