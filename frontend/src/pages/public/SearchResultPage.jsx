import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, Typography, Input, Space, Tag, Empty, Spin, Pagination } from 'antd';
import { EyeOutlined, ClockCircleOutlined, SearchOutlined, FolderOutlined } from '@ant-design/icons';
import { searchArticles } from '../../api/articleApi';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;

export default function SearchResultPage() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    if (keyword) {
      doSearch(keyword, 1);
    }
  }, [keyword]);

  const doSearch = async (kw, p) => {
    setLoading(true);
    try {
      const data = await searchArticles(kw, p, pageSize);
      setArticles(data.content);
      setTotal(data.totalElements);
      setPage(p);
    } catch {
      // error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  if (!keyword) {
    return (
      <Empty description="请输入搜索关键词" />
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        搜索结果："{keyword}"
      </Title>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 100 }}>
          <Spin size="large" />
        </div>
      ) : articles.length === 0 ? (
        <Empty description={`未找到与 "${keyword}" 相关的文章`} />
      ) : (
        <>
          <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
            Found {total} 篇文章
          </Text>
          <div>
            {articles.map((article) => (
              <div key={article.id} style={{ marginBottom: 16 }}>
                <Link to={`/articles/${article.id}`} style={{ textDecoration: 'none' }}>
                <Card
                  hoverable
                  style={{ width: '100%' }}
                >
                  <Card.Meta
                    title={
                      <span style={{ fontSize: 18 }}>
                        {article.title}
                      </span>
                    }
                    description={
                      <div>
                        <Paragraph
                          ellipsis={{ rows: 2 }}
                          style={{ marginBottom: 12, color: '#666' }}
                        >
                          {article.summary || (article.content || '').replace(/<[^>]*>/g, '').substring(0, 200)}
                        </Paragraph>
                        <Space size="middle" style={{ color: '#999', fontSize: 13 }}>
                          <span><ClockCircleOutlined /> {dayjs(article.createdAt).format('YYYY-MM-DD HH:mm')}</span>
                          <span><EyeOutlined /> {article.viewCount} 次阅读</span>
                          {article.categoryName && (
                            <Tag color="blue">{article.categoryName}</Tag>
                          )}
                          {article.tagNames && article.tagNames.map((tagName) => (
                            <Tag key={tagName} color="green">{tagName}</Tag>
                          ))}
                          <Tag color="blue">{article.authorName}</Tag>
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
              onChange={(p) => doSearch(keyword, p)}
              showTotal={(t) => `共 ${t} 篇文章`}
            />
          </div>
        </>
      )}
    </div>
  );
}
