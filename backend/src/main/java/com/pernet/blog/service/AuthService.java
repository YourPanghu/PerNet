package com.pernet.blog.service;

import com.pernet.blog.config.JwtUtil;
import com.pernet.blog.dto.LoginRequest;
import com.pernet.blog.dto.LoginResponse;
import com.pernet.blog.entity.AdminUser;
import com.pernet.blog.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AdminUserService adminUserService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RedisService redisService;

    @Value("${app.jwt.expiration}")
    private long jwtExpiration;

    public LoginResponse login(LoginRequest request) {
        AdminUser user = adminUserService.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        String token = jwtUtil.generateToken(user.getUsername());

        // Store token in Redis whitelist — TTL matches JWT expiration
        redisService.cacheToken(token, user.getUsername(), jwtExpiration);

        return LoginResponse.builder()
                .token(token)
                .username(user.getUsername())
                .nickname(user.getNickname())
                .build();
    }

    public void logout(String token) {
        if (token != null && !token.isBlank()) {
            redisService.deleteToken(token);
        }
    }
}
