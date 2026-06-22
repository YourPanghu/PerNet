import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Typography, Breadcrumb, Divider, Spin, Result, Space, Tag, Affix, FloatButton, Drawer, Grid, theme } from 'antd';
import {
  EyeOutlined, ClockCircleOutlined, ArrowLeftOutlined,
  UnorderedListOutlined, MenuOutlined, FolderOutlined,
} from '@ant-design/icons';
import { fetchArticle, incrementArticleView } from '../../api/articleApi';
import DOMPurify from 'dompurify';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

function extractTocFromHtml(html) {
  const headings = [];
  let idCounter = 0;

  const processedHtml = html.replace(
    /<(h[1-3])([^>]*)>(.*?)<\/\1>/gi,
    (match, tag, attrs, inner) => {
      const plainText = inner.replace(/<[^>]*>/g, '').trim();
      if (!plainText) return match;

      idCounter++;
      const anchorId = `toc-${idCounter}-${plainText
        .replace(/[^\w一-鿿]+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase()}`;
      const level = parseInt(tag.charAt(1), 10);

      headings.push({ id: anchorId, text: plainText, level });

      if (/id\s*=/i.test(attrs)) {
        return `<${tag}${attrs}>${inner}</${tag}>`;
      }
      return `<${tag}${attrs} id="${anchorId}">${inner}</${tag}>`;
    },
  );

  return { headings, processedHtml };
}

export default function ArticleDetailPage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeId, setActiveId] = useState('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const contentRef = useRef(null);
  const headingElementsRef = useRef([]);
  const fetchedIdRef = useRef(null);
  const viewRecordedRef = useRef(false);
  const { token } = theme.useToken();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const loadArticle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchArticle(id);
      setArticle(data);
      if (!viewRecordedRef.current) {
        viewRecordedRef.current = true;
        incrementArticleView(id).then((updated) => {
          setArticle(updated);
        }).catch(() => {});
      }
    } catch (err) {
      setError(err.response?.data?.message || '文章不存在');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (fetchedIdRef.current === id) return;
    fetchedIdRef.current = id;
    viewRecordedRef.current = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
    loadArticle();
  }, [id, loadArticle]);

  const tocData = useMemo(() => {
    if (!article?.content) return { headings: [], processedHtml: '' };
    return extractTocFromHtml(article.content);
  }, [article?.content]);

  useEffect(() => {
    if (!contentRef.current || tocData.headings.length === 0) return;
    const timer = setTimeout(() => {
      headingElementsRef.current = tocData.headings
        .map(({ id: hid }) => contentRef.current?.querySelector(`#${hid}`))
        .filter(Boolean);
    }, 100);
    return () => clearTimeout(timer);
  }, [tocData.headings]);

  useEffect(() => {
    if (headingElementsRef.current.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const inView = entries.filter((e) => e.isIntersecting).map((e) => e.target);
        if (inView.length > 0) {
          setActiveId(inView[0].id);
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    );
    const els = [...headingElementsRef.current];
    els.forEach((el) => observer.observe(el));
    return () => {
      els.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [tocData.headings]);

  const scrollToHeading = useCallback((anchorId) => {
    const el = document.getElementById(anchorId);
    if (el) {
      setActiveId(anchorId);
      const top = el.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    setMobileDrawerOpen(false);
  }, []);

  const sanitizedContent = useMemo(
    () => DOMPurify.sanitize(tocData.processedHtml, { ADD_ATTR: ['target'] }),
    [tocData.processedHtml],
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Result
        status="404"
        title="文章不存在"
        subTitle={error}
        extra={<Link to="/">返回首页</Link>}
      />
    );
  }

  if (!article) return null;

  const hasToc = tocData.headings.length > 0;

  const tocPanel = (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        marginBottom: 12, paddingBottom: 8,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
      }}>
        <UnorderedListOutlined style={{ color: token.colorPrimary, fontSize: 16 }} />
        <Text strong style={{ fontSize: 15, color: token.colorText }}>目录</Text>
      </div>
      <nav>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {tocData.headings.map(({ id: anchorId, text, level }) => {
            const isActive = activeId === anchorId;
            return (
              <li key={anchorId} style={{ paddingLeft: (level - 1) * 16, marginBottom: 4 }}>
                <a
                  onClick={(e) => { e.preventDefault(); scrollToHeading(anchorId); }}
                  style={{
                    display: 'block', padding: '4px 8px',
                    fontSize: 13, lineHeight: '22px',
                    color: isActive ? token.colorPrimary : token.colorTextSecondary,
                    backgroundColor: isActive ? token.colorPrimaryBg : 'transparent',
                    borderRadius: token.borderRadiusSM,
                    borderLeft: isActive ? `3px solid ${token.colorPrimary}` : '3px solid transparent',
                    textDecoration: 'none', cursor: 'pointer',
                    transition: 'all 0.15s',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}
                  title={text}
                >
                  {text}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: isMobile ? 0 : 32 }}>
        {/* 文章正文 */}
        <div style={{ flex: 1, minWidth: 0, maxWidth: 800, margin: '0 auto 0 0' }}>
          <Breadcrumb
            style={{ marginBottom: isMobile ? 16 : 24 }}
            items={[
              { title: <Link to="/">首页</Link> },
              { title: article.title },
            ]}
          />
          <Link to="/" state={{ scrollPastHero: true }} style={{ display: 'inline-block', marginBottom: isMobile ? 16 : 24 }}>
            <ArrowLeftOutlined /> 返回文章列表
          </Link>
          <Title level={isMobile ? 2 : 1} style={{ wordBreak: 'break-word' }}>{article.title}</Title>
          <Space size={isMobile ? 4 : 'middle'} style={{ color: token.colorTextQuaternary, marginBottom: 16 }} wrap>
            <Text type="secondary"><ClockCircleOutlined /> {dayjs(article.createdAt).format('YYYY-MM-DD HH:mm')}</Text>
            <Text type="secondary"><EyeOutlined /> {article.viewCount} 次阅读</Text>
            <Tag color="blue">{article.authorName}</Tag>
            {article.categoryName && (
              <Tag icon={<FolderOutlined />} color="blue">{article.categoryName}</Tag>
            )}
            {article.tagNames && article.tagNames.map((tagName) => (
              <Tag key={tagName} color="green">{tagName}</Tag>
            ))}
          </Space>
          {article.coverImage && (
            <img
              src={article.coverImage} alt={article.title}
              style={{ maxWidth: '100%', borderRadius: 8, marginBottom: 24 }}
            />
          )}
          <Divider />
          <div
            ref={contentRef}
            className="article-content"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            style={{ lineHeight: 1.8, fontSize: isMobile ? 15 : 16, wordBreak: 'break-word', overflowWrap: 'break-word' }}
          />
        </div>

        {/* 桌面端右侧悬浮目录 */}
        {hasToc && !isMobile && (
          <aside
            className="article-toc-desktop"
            style={{
              width: 240, flexShrink: 0,
              display: 'block',
              marginRight: -30,
            }}
          >
            <Affix offsetTop={80}>
              <div style={{
                background: token.colorBgContainer, borderRadius: token.borderRadiusLG, padding: 16,
                boxShadow: token.boxShadowTertiary,
                maxHeight: 'calc(100vh - 120px)', overflowY: 'auto',
              }}>
                {tocPanel}
              </div>
            </Affix>
          </aside>
        )}
      </div>

      {/* 移动端悬浮按钮 + 抽屉 */}
      {hasToc && isMobile && (
        <>
          <FloatButton
            className="article-toc-fab"
            icon={<MenuOutlined />}
            type="primary"
            onClick={() => setMobileDrawerOpen(true)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />
          <Drawer
            title="目录"
            placement="right"
            size={280}
            onClose={() => setMobileDrawerOpen(false)}
            open={mobileDrawerOpen}
          >
            {tocPanel}
          </Drawer>
        </>
      )}
    </div>
  );
}
