package com.pernet.blog.config;

import com.pernet.blog.entity.AdminUser;
import com.pernet.blog.entity.Article;
import com.pernet.blog.entity.BlogProfile;
import com.pernet.blog.entity.Category;
import com.pernet.blog.repository.AdminUserRepository;
import com.pernet.blog.repository.ArticleRepository;
import com.pernet.blog.repository.BlogProfileRepository;
import com.pernet.blog.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final AdminUserRepository adminUserRepository;
    private final ArticleRepository articleRepository;
    private final BlogProfileRepository blogProfileRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        AdminUser admin = seedAdminUser();
        seedBlogProfile();
        List<Category> categories = seedCategories();
        seedSampleArticles(admin, categories);
    }

    private AdminUser seedAdminUser() {
        if (adminUserRepository.existsByUsername("admin")) {
            log.info("Admin user already exists, skipping seed.");
            return adminUserRepository.findByUsername("admin").orElseThrow();
        }
        AdminUser admin = AdminUser.builder()
                .username("admin")
                .password(passwordEncoder.encode("admin123"))
                .nickname("Admin")
                .build();
        admin = adminUserRepository.save(admin);
        log.info("Seeded admin user: admin / admin123");
        return admin;
    }

    private void seedBlogProfile() {
        if (blogProfileRepository.count() > 0) {
            log.info("BlogProfile already exists, skipping seed.");
            return;
        }
        BlogProfile profile = BlogProfile.builder()
                .nickname("PerNet")
                .avatar("")
                .coverImage("")
                .bio("分享技术与生活，记录成长的每一步。")
                .build();
        blogProfileRepository.save(profile);
        log.info("Seeded blog profile.");
    }

    private List<Category> seedCategories() {
        if (categoryRepository.count() > 0) {
            log.info("Categories already exist ({} found), skipping seed.", categoryRepository.count());
            return categoryRepository.findAll();
        }
        List<Category> categories = List.of(
            Category.builder().name("技术").description("技术文章与编程心得").build(),
            Category.builder().name("生活").description("生活感悟与日常记录").build(),
            Category.builder().name("杂谈").description("杂谈随笔与思考").build()
        );
        categories = categoryRepository.saveAll(categories);
        log.info("Seeded {} categories.", categories.size());
        return categories;
    }

    private void seedSampleArticles(AdminUser author, List<Category> categories) {
        if (articleRepository.count() > 0) {
            log.info("Articles already exist ({} found), skipping seed.", articleRepository.count());
            return;
        }

        Category tech = categories.stream().filter(c -> "技术".equals(c.getName())).findFirst().orElse(null);
        Category life = categories.stream().filter(c -> "生活".equals(c.getName())).findFirst().orElse(null);
        Category misc = categories.stream().filter(c -> "杂谈".equals(c.getName())).findFirst().orElse(null);

        List<Article> articles = List.of(
            Article.builder()
                .title("欢迎来到我的博客")
                .content("<h2>Hello, World!</h2><p>这是我的第一篇博客文章。在这里，我将分享技术心得、生活感悟和学习笔记。</p><p>博客使用 <strong>Spring Boot + React + SQLite</strong> 构建，支持文章发布、编辑、删除和搜索功能。</p><p>希望你能在这里找到有价值的内容！</p>")
                .summary("第一篇博客文章，介绍本博客的用途和技术栈。")
                .status(Article.ArticleStatus.PUBLISHED)
                .viewCount(128L)
                .category(life)
                .author(author)
                .build(),
            Article.builder()
                .title("Spring Boot 3 入门指南")
                .content("<h2>Spring Boot 3 新特性</h2><p>Spring Boot 3 带来了许多令人兴奋的新特性：</p><ul><li>基于 Java 17 的基线版本</li><li>原生支持 GraalVM 编译</li><li>改进的可观测性</li><li>Jakarta EE 9 支持</li></ul><h3>快速开始</h3><p>使用 Spring Initializr 可以快速创建一个 Spring Boot 3 项目。选择你需要的依赖，然后下载并运行即可。</p><p>这是一个非常强大的框架，值得深入学习！</p>")
                .summary("介绍 Spring Boot 3 的核心新特性和快速入门方法。")
                .status(Article.ArticleStatus.PUBLISHED)
                .viewCount(256L)
                .category(tech)
                .author(author)
                .build(),
            Article.builder()
                .title("React 18 最佳实践")
                .content("<h2>React 18 核心概念</h2><p>React 18 引入了许多重要的新特性：</p><h3>并发渲染</h3><p>Concurrent Mode 让 React 可以在渲染过程中暂停和恢复工作，使得用户界面更加响应。</p><h3>自动批处理</h3><p>React 18 会自动批处理多个状态更新，减少不必要的重渲染。</p><h3>Suspense 改进</h3><p>Suspense 现在可以用于数据获取场景，而不仅仅是代码分割。</p><p>在实际项目中，这些特性可以显著提升用户体验。</p>")
                .summary("分享 React 18 的最佳实践和核心特性使用技巧。")
                .status(Article.ArticleStatus.PUBLISHED)
                .viewCount(189L)
                .category(tech)
                .author(author)
                .build(),
            Article.builder()
                .title("SQLite 在小型项目中的优势")
                .content("<h2>为什么要选择 SQLite？</h2><p>SQLite 是一个嵌入式关系数据库，具有以下优势：</p><ul><li><strong>零配置</strong>：无需安装和配置数据库服务器</li><li><strong>轻量级</strong>：整个数据库就是一个文件，方便备份和迁移</li><li><strong>跨平台</strong>：支持所有主流操作系统</li><li><strong>事务支持</strong>：完整的 ACID 事务支持</li></ul><h3>适用场景</h3><p>SQLite 特别适合个人博客、小型 Web 应用、移动应用和嵌入式设备。</p><p>对于日均访问量在几万级别的个人站点，SQLite 完全能够胜任。</p>")
                .summary("分析 SQLite 在个人项目和小型应用中的优势与最佳实践。")
                .status(Article.ArticleStatus.PUBLISHED)
                .viewCount(72L)
                .category(tech)
                .author(author)
                .build(),
            Article.builder()
                .title("草稿：Ant Design 5 组件库解析")
                .content("<h2>Ant Design 5 概览</h2><p>Ant Design 5 带来了全新的设计语言和开发体验：</p><ul><li>CSS-in-JS 方案，动态主题切换</li><li>更简洁的 API 设计</li><li>更好的 TypeScript 支持</li></ul><p>这篇文章还在编写中...</p>")
                .summary("Ant Design 5 的新特性和使用技巧（建设中）。")
                .status(Article.ArticleStatus.DRAFT)
                .viewCount(0L)
                .category(misc)
                .author(author)
                .build()
        );

        articleRepository.saveAll(articles);
        log.info("Seeded {} sample articles.", articles.size());
    }
}
