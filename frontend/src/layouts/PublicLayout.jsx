import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout, Input, Typography, Avatar, Divider, Button, Drawer, Grid, theme,
} from 'antd';
import {
  SearchOutlined,
  FolderOutlined,
  TagsOutlined,
  MenuOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { fetchProfile } from '../api/profileApi';
import { fetchCategories } from '../api/categoryApi';
import { fetchTags } from '../api/tagApi';
import { useTheme } from '../context/ThemeContext';

const { Header: AntHeader, Content, Footer, Sider } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export default function PublicLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue, setSearchValue] = useState('');
  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { darkMode, toggleTheme } = useTheme();
  const { token } = theme.useToken();
  const screens = useBreakpoint();
  const isMobile = !screens.md; // < 768px
  const isTablet = screens.md && !screens.lg; // 768~1023px

  // URL 读取分类/标签
  const searchParams = new URLSearchParams(location.search);
  const activeCategoryId = searchParams.get('categoryId');
  const activeTagId = searchParams.get('tagId');

  useEffect(() => {
    fetchProfile().then(setProfile).catch(() => {});
    fetchCategories().then(setCategories).catch(() => {});
    fetchTags().then(setTags).catch(() => {});
  }, []);

  const onSearch = (value) => {
    if (value.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(value.trim())}`);
    }
  };

  // 侧边栏宽度：平板最小 200px，桌面 20vw 不超 280px
  const sidebarWidth = isMobile ? 0 : isTablet ? 200 : Math.min(Math.max(window.innerWidth * 0.2, 220), 280);

  // 左侧栏内容
  const sidebarContent = (
    <div style={{ padding: '0 4px' }}>
      <Link to="/" style={{ display: 'block', textAlign: 'center', marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0, color: token.colorPrimary }}>
          🏠 PerNet Blog
        </Title>
      </Link>

      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <Avatar
          size={isTablet ? 60 : 80}
          src={profile?.avatar || undefined}
          style={{
            backgroundColor: profile?.avatar ? 'transparent' : token.colorPrimary,
            marginBottom: 12,
            fontSize: isTablet ? 24 : 32,
          }}
        >
          {(profile?.nickname || 'P')[0].toUpperCase()}
        </Avatar>
        <div style={{ fontWeight: 600, fontSize: isTablet ? 14 : 16, marginBottom: 4, color: token.colorText }}>
          {profile?.nickname || '博主'}
        </div>
        <Text type="secondary" style={{ fontSize: isTablet ? 12 : 13, lineHeight: 1.5 }}>
          {profile?.bio || '分享技术与生活'}
        </Text>
      </div>

      <Divider style={{ margin: '12px 0', borderColor: token.colorBorderSecondary }} />

      {/* 分类列表 */}
      <div style={{ marginBottom: 4 }}>
        <Text strong style={{ fontSize: 13, color: token.colorTextQuaternary, marginBottom: 10, display: 'block' }}>
          <FolderOutlined style={{ marginRight: 4 }} />
          文章分类
        </Text>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: isTablet ? 6 : 8 }}>
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center',
              minWidth: isTablet ? 56 : 64, padding: isTablet ? '6px 8px' : '8px 10px', borderRadius: 8,
              fontSize: isTablet ? 12 : 13, textDecoration: 'none',
              color: !activeCategoryId ? token.colorWhite : token.colorText,
              backgroundColor: !activeCategoryId ? token.colorPrimary : token.colorFillSecondary,
              fontWeight: !activeCategoryId ? 600 : 400,
              transition: 'all 0.15s',
              boxShadow: !activeCategoryId ? `0 2px 6px ${token.colorPrimaryBg}` : 'none',
              flex: '0 0 auto',
            }}
          >
            <span style={{ fontSize: 15, lineHeight: '20px' }}>📋</span>
            <span style={{ marginTop: 2 }}>全部</span>
          </Link>
          {categories.map((cat) => {
            const isActive = activeCategoryId === String(cat.id);
            const emojis = { '技术': '💻', '生活': '🌟', '杂谈': '💬' };
            return (
              <Link
                key={cat.id}
                to={`/?categoryId=${cat.id}`}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: isTablet ? 56 : 64, padding: isTablet ? '6px 8px' : '8px 10px', borderRadius: 8,
                  fontSize: isTablet ? 12 : 13, textDecoration: 'none',
                  color: isActive ? token.colorWhite : token.colorText,
                  backgroundColor: isActive ? token.colorPrimary : token.colorFillSecondary,
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.15s',
                  boxShadow: isActive ? `0 2px 6px ${token.colorPrimaryBg}` : 'none',
                  flex: '0 0 auto',
                }}
              >
                <span style={{ fontSize: 15, lineHeight: '20px' }}>
                  {emojis[cat.name] || '📌'}
                </span>
                <span style={{ marginTop: 2 }}>{cat.name}</span>
                <span style={{
                  fontSize: 10, marginTop: 1,
                  color: isActive ? 'rgba(255,255,255,0.7)' : token.colorTextQuaternary,
                }}>
                  {cat.articleCount}篇
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <Divider style={{ margin: '12px 0', borderColor: token.colorBorderSecondary }} />

      {/* 标签列表 */}
      <div style={{ marginBottom: 4 }}>
        <Text strong style={{ fontSize: 13, color: token.colorTextQuaternary, marginBottom: 10, display: 'block' }}>
          <TagsOutlined style={{ marginRight: 4 }} />
          文章标签
        </Text>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: isTablet ? 6 : 8 }}>
          {tags.length === 0 && (
            <Text type="secondary" style={{ fontSize: 12 }}>暂无标签</Text>
          )}
          {tags.map((tag) => {
            const isActive = activeTagId === String(tag.id);
            return (
              <Link
                key={tag.id}
                to={`/?tagId=${tag.id}`}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: isTablet ? '5px 10px' : '6px 12px', borderRadius: 20,
                  fontSize: isTablet ? 12 : 13, textDecoration: 'none',
                  color: isActive ? token.colorWhite : token.colorText,
                  backgroundColor: isActive ? token.colorPrimary : token.colorFillSecondary,
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.15s',
                  boxShadow: isActive ? `0 2px 6px ${token.colorPrimaryBg}` : 'none',
                  flex: '0 0 auto',
                }}
              >
                <span>{tag.name}</span>
                <span style={{
                  fontSize: 10, marginLeft: 4,
                  color: isActive ? 'rgba(255,255,255,0.7)' : token.colorTextQuaternary,
                }}>
                  {tag.articleCount}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 顶部导航栏 */}
      <AntHeader
        className="public-top-header"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: isMobile ? '0 12px' : '0 24px',
          position: 'sticky', top: 0, zIndex: 100,
          height: isMobile ? 48 : 56,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button
            className="public-mobile-menu-btn"
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileMenuOpen(true)}
            style={{ display: 'none' }}
          />
          <Link to="/" className="public-mobile-logo" style={{ display: 'none' }}>
            <Title level={5} style={{ margin: 0, color: token.colorPrimary }}>🏠 PerNet</Title>
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 25 }}>
          <span className="glass-search-bar">
            <Input
              placeholder={isMobile ? '搜索...' : '搜索文章...'}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onPressEnter={(e) => onSearch(e.target.value)}
              style={{ width: isMobile ? 160 : isTablet ? 260 : 350 }}
              prefix={<SearchOutlined />}
              allowClear
            />
          </span>
          <Button
            type="text"
            icon={darkMode ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggleTheme}
            title={darkMode ? '切换白天模式' : '切换黑夜模式'}
          />
        </div>
      </AntHeader>

      <Layout>
        {/* 桌面端 & 平板侧边栏 */}
        {!isMobile && (
          <Sider
            className="public-sidebar"
            width={sidebarWidth}
            style={{
              background: token.colorBgContainer,
              borderRight: `1px solid ${token.colorBorderSecondary}`,
              padding: isTablet ? '20px 12px' : '24px 16px',
              position: 'sticky',
              top: isMobile ? 48 : 56,
              height: `calc(100vh - ${isMobile ? 48 : 56}px)`,
              overflowY: 'auto',
            }}
          >
            {sidebarContent}
          </Sider>
        )}

        {/* 移动端 Drawer */}
        {isMobile && (
          <Drawer
            title="PerNet Blog"
            placement="left"
            width={260}
            onClose={() => setMobileMenuOpen(false)}
            open={mobileMenuOpen}
            className="public-mobile-drawer"
          >
            {sidebarContent}
          </Drawer>
        )}

        {/* 主要内容区域 */}
        <Content style={{
          padding: isMobile ? '16px 12px' : isTablet ? '20px 20px' : '24px 32px',
          maxWidth: 900,
          margin: '0 auto',
          width: '100%',
          minHeight: `calc(100vh - ${isMobile ? 48 : 56}px)`,
        }}>
          <Outlet />
        </Content>
      </Layout>

      <Footer style={{ textAlign: 'center', fontSize: isMobile ? 11 : 13, color: token.colorTextQuaternary, padding: isMobile ? '12px' : undefined }}>
        PerNet Blog ©2026 — Built with Spring Boot + React + SQLite
      </Footer>
    </Layout>
  );
}
