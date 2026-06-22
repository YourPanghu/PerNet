package com.pernet.blog.service;

import com.pernet.blog.entity.AdminUser;
import com.pernet.blog.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminUserService {

    private final AdminUserRepository adminUserRepository;

    public Optional<AdminUser> findByUsername(String username) {
        return adminUserRepository.findByUsername(username);
    }

    @Transactional
    public AdminUser save(AdminUser user) {
        return adminUserRepository.save(user);
    }
}
