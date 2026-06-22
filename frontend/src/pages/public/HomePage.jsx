import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { Card, Typography, Tag, Space, Empty, Spin, Breadcrumb, Pagination, Grid, theme } from 'antd';
import { EyeOutlined, ClockCircleOutlined, FolderOutlined, DownOutlined } from '@ant-design/icons';
import { fetchArticles } from '../../api/articleApi';
import { fetchCategories } from '../../api/categoryApi';
import { fetchTags } from '../../api/tagApi';
import { fetchProfile } from '../../api/profileApi';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const scrolledRef = useRef(false);
  const categoryId = searchParams.get('categoryId');
  const tagId = searchParams.get('tagId');
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const pageSize = 10;
  const { token } = theme.useToken();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
    fetchTags().then(setTags).catch(() => {});
    fetchProfile().then(setProfile).catch(() => {});
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });

    if (location.state?.scrollPastHero && !scrolledRef.current) {
      scrolledRef.current = true;
      const jump = () => window.scrollTo({ top: window.innerHeight, behavior: 'instant' });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          jump();
        });
      });
    }

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    loadArticles(1, categoryId, tagId);
  }, [categoryId, tagId]);

  const loadArticles = async (p, catId, tId) => {
    setLoading(true);
    try {
      const data = await fetchArticles(p, pageSize, catId || undefined, tId || undefined);
      setArticles(data.content);
      setTotal(data.totalElements);
      setPage(p);
    } catch {
      // error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const currentCategoryName = categoryId
    ? categories.find((c) => c.id === Number(categoryId))?.name
    : null;
  const currentTagName = tagId
    ? tags.find((t) => t.id === Number(tagId))?.name
    : null;

  const VH = typeof window !== 'undefined' ? window.innerHeight : 800;
  const heroProgress = Math.max(0, Math.min(1, scrollY / (VH * 0.7)));
  const heroOpacity = 1 - heroProgress;
  const heroScale = 1 + heroProgress * 0.08;

  return (
    <div>
      {/* ====== Hero ====== */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: heroOpacity > 0.01 ? 1 : -1,
        opacity: heroOpacity,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          background: profile?.coverImage
            ? `url(${profile.coverImage}) center/cover no-repeat`
            : 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
          transform: `scale(${heroScale}) translateY(${heroProgress * 50}px)`,
          transformOrigin: 'center center',
          willChange: 'transform',
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.5) 100%)',
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          textAlign: 'center',
          padding: '0 24px',
          transform: `translateY(${-heroProgress * 80}px)`,
        }}>
          <h1 style={{
            fontSize: isMobile ? 'clamp(28px, 8vw, 40px)' : 'clamp(32px, 5vw, 56px)',
            fontWeight: 700,
            margin: '0 0 16px',
            letterSpacing: '-1px',
            color: '#fff',
            textShadow: '0 2px 20px rgba(0,0,0,0.3)',
          }}>
            {profile?.nickname || 'PerNet Blog'}
          </h1>
          <p style={{
            fontSize: isMobile ? 'clamp(14px, 4vw, 18px)' : 'clamp(16px, 2vw, 20px)',
            color: 'rgba(255,255,255,0.85)',
            margin: '0 0 32px',
            maxWidth: 500,
            padding: '0 8px',
          }}>
            {profile?.bio || '分享技术与生活'}
          </p>
          <div style={{
            animation: 'home-bounce 2s ease-in-out infinite',
            fontSize: 14,
            color: 'rgba(255,255,255,0.6)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}>
            <span>向下滚动查看</span>
            <DownOutlined style={{ fontSize: 18 }} />
          </div>
        </div>
      </div>

      {/* 透明占位 */}
      <div style={{ height: '100vh', pointerEvents: 'none' }} />

      {/* ====== 文章内容区 ====== */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        background: token.colorBgLayout,
        margin: isMobile ? '-16px -12px' : '-24px -32px',
        padding: isMobile ? '20px 12px 16px' : '32px 32px 24px',
        borderRadius: isMobile ? '20px 20px 0 0' : '24px 24px 0 0',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
        minHeight: '80vh',
      }}>
        {currentCategoryName && (
          <Breadcrumb
            style={{ marginBottom: 16 }}
            items={[
              { title: <Link to="/">全部文章</Link> },
              { title: currentCategoryName },
            ]}
          />
        )}
        {currentTagName && (
          <Breadcrumb
            style={{ marginBottom: 16 }}
            items={[
              { title: <Link to="/">全部文章</Link> },
              { title: `标签：${currentTagName}` },
            ]}
          />
        )}

        <Title level={isMobile ? 3 : 2} style={{ marginBottom: 8, marginTop: 0 }}>
          {currentTagName ? `标签：${currentTagName}` : currentCategoryName ? `分类：${currentCategoryName}` : '文章列表'}
        </Title>
        {(currentCategoryName || currentTagName) && (
          <Link to="/" style={{ fontSize: 14, color: token.colorPrimary, display: 'inline-block', marginBottom: 24 }}>
            ← 查看全部文章
          </Link>
        )}

        {loading && articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: isMobile ? 60 : 100 }}>
            <Spin size="large" />
          </div>
        ) : articles.length === 0 ? (
          <Empty description={currentTagName ? '该标签下暂无文章' : currentCategoryName ? '该分类下暂无文章' : '暂无文章'} />
        ) : (
          <div>
            {articles.map((article) => (
              <div key={article.id} style={{ marginBottom: isMobile ? 12 : 16 }}>
                <Link to={`/articles/${article.id}`} style={{ textDecoration: 'none' }}>
                <Card
                  hoverable
                  style={{ width: '100%' }}
                  bodyStyle={isMobile ? { padding: 16 } : undefined}
                >
                  <Card.Meta
                    title={
                      <span style={{ fontSize: isMobile ? 15 : 18 }}>
                        {article.title}
                      </span>
                    }
                    description={
                      <div>
                        <Paragraph
                          ellipsis={{ rows: isMobile ? 2 : 2 }}
                          style={{ marginBottom: 12, color: token.colorTextSecondary, fontSize: isMobile ? 13 : 14 }}
                        >
                          {article.summary || (article.content || '').replace(/<[^>]*>/g, '').substring(0, 200)}
                        </Paragraph>
                        <Space size={isMobile ? 4 : 'middle'} style={{ color: token.colorTextQuaternary, fontSize: isMobile ? 12 : 13 }} wrap>
                          <span><ClockCircleOutlined /> {dayjs(article.createdAt).format('YYYY-MM-DD HH:mm')}</span>
                          <span><EyeOutlined /> {article.viewCount} 次阅读</span>
                          {article.categoryName && (
                            <Tag icon={<FolderOutlined />} color="blue">{article.categoryName}</Tag>
                          )}
                          {article.tagNames && article.tagNames.map((tagName) => (
                            <Tag key={tagName} color="green">{tagName}</Tag>
                          ))}
                          <Tag>{article.authorName}</Tag>
                        </Space>
                      </div>
                    }
                  />
                </Card>
                </Link>
              </div>
            ))}
            <Pagination
              current={page}
              total={total}
              pageSize={pageSize}
              onChange={(p) => loadArticles(p, categoryId, tagId)}
              showTotal={(t) => `共 ${t} 篇文章`}
              size={isMobile ? 'small' : 'default'}
              responsive
            />
          </div>
        )}
      </div>
    </div>
  );
}
