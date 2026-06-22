package com.pernet.blog.repository;

import com.pernet.blog.entity.BlogProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BlogProfileRepository extends JpaRepository<BlogProfile, Long> {
}
