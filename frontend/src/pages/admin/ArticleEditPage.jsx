import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Spin, Result, message, Button, Space, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import ArticleForm from '../../components/admin/ArticleForm';
import { adminFetchArticle, updateArticle, deleteArticle } from '../../api/articleApi';

const { Title } = Typography;

export default function ArticleEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadArticle();
  }, [id]);

  const loadArticle = async () => {
    setFetching(true);
    setError(null);
    try {
      const data = await adminFetchArticle(id);
      setArticle(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Article not found');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await updateArticle(id, values);
      message.success('Article updated successfully!');
      navigate('/admin');
    } catch {
      // error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteArticle(id);
      message.success('Article deleted');
      navigate('/admin');
    } catch {
      // error handled by interceptor
    }
  };

  if (fetching) {
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
        title="Article Not Found"
        subTitle={error}
        extra={<Button onClick={() => navigate('/admin')}>Back to Dashboard</Button>}
      />
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          编辑文章：{article?.title}
        </Title>
        <Popconfirm
          title="确定删除这篇文章？"
          description="此操作不可撤销。"
          onConfirm={handleDelete}
          okText="删除"
          okType="danger"
          cancelText="取消"
        >
          <Button danger icon={<DeleteOutlined />}>
            删除文章
          </Button>
        </Popconfirm>
      </div>
      {article && (
        <ArticleForm
          initialValues={{
            title: article.title,
            content: article.content,
            summary: article.summary || '',
            coverImage: article.coverImage || '',
            status: article.status,
            categoryId: article.categoryId || undefined,
          }}
          onSubmit={handleSubmit}
          loading={loading}
          submitLabel="更新文章"
        />
      )}
    </div>
  );
}
