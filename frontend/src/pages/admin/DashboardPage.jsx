import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Table, Button, Input, Space, Tag, Popconfirm, Typography, message, Grid } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { adminFetchArticles, deleteArticle } from '../../api/articleApi';
import dayjs from 'dayjs';

const { Title } = Typography;
const { useBreakpoint } = Grid;

export default function DashboardPage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const pageSize = 10;
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async (p = 1, kw = keyword) => {
    setLoading(true);
    try {
      const data = await adminFetchArticles(p, pageSize, kw);
      setArticles(data.content);
      setTotal(data.totalElements);
      setPage(p);
    } catch {
      // error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadArticles(1, keyword);
  };

  const handleDelete = async (id) => {
    try {
      await deleteArticle(id);
      message.success('Article deleted');
      loadArticles(page);
    } catch {
      // error handled by interceptor
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text, record) => (
        <a onClick={() => navigate(`/admin/articles/${record.id}/edit`)}>
          {text}
        </a>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'PUBLISHED' ? 'green' : 'orange'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Author',
      dataIndex: 'authorName',
      key: 'authorName',
      width: 100,
    },
    {
      title: 'Views',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 80,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 230,
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => window.open(`/articles/${record.id}`, '_blank')}
          />
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/articles/${record.id}/edit`)}
          />
          <Popconfirm
            title="Delete this article?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            okType="danger"
            cancelText="Cancel"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>Article Management</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/admin/articles/new')}
          size={isMobile ? 'small' : 'default'}
        >
          New Article
        </Button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="Search articles..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            prefix={<SearchOutlined />}
            style={{ width: isMobile ? '100%' : 300 }}
            allowClear
          />
          <Button onClick={handleSearch}>Search</Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={articles}
        rowKey="id"
        loading={loading}
        scroll={isMobile ? { x: 600 } : undefined}
        size={isMobile ? 'small' : 'default'}
        pagination={{
          current: page,
          total,
          pageSize,
          onChange: (p) => loadArticles(p),
          showTotal: (t) => `Total ${t} articles`,
          size: isMobile ? 'small' : 'default',
          responsive: true,
        }}
      />
    </div>
  );
}
