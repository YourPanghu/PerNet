import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, message } from 'antd';
import ArticleForm from '../../components/admin/ArticleForm';
import { createArticle } from '../../api/articleApi';

const { Title } = Typography;

export default function ArticleCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await createArticle(values);
      message.success('Article created successfully!');
      navigate('/admin');
    } catch {
      // error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <Title level={3} style={{ marginBottom: 24 }}>Create New Article</Title>
      <ArticleForm onSubmit={handleSubmit} loading={loading} submitLabel="Create Article" />
    </div>
  );
}
