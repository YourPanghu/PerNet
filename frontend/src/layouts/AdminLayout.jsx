import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Typography, Grid, theme } from 'antd';
import {
  FileTextOutlined,
  PlusOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  FolderOutlined,
  TagsOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;
const { useBreakpoint } = Grid;

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { token } = theme.useToken();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    {
      key: '/admin',
      icon: <FileTextOutlined />,
      label: '文章管理',
    },
    {
      key: '/admin/articles/new',
      icon: <PlusOutlined />,
      label: '新建文章',
    },
    {
      type: 'divider',
    },
    {
      key: '/admin/categories',
      icon: <FolderOutlined />,
      label: '分类管理',
    },
    {
      key: '/admin/tags',
      icon: <TagsOutlined />,
      label: '标签管理',
    },
    {
      key: '/admin/profile',
      icon: <SettingOutlined />,
      label: '博客设置',
    },
  ];

  const selectedKey = (() => {
    if (location.pathname.startsWith('/admin/categories')) return '/admin/categories';
    if (location.pathname.startsWith('/admin/tags')) return '/admin/tags';
    if (location.pathname.startsWith('/admin/profile')) return '/admin/profile';
    if (location.pathname === '/admin/articles/new') return '/admin/articles/new';
    return '/admin';
  })();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={isMobile ? true : collapsed}
        breakpoint="md"
        onBreakpoint={(broken) => { if (broken) setCollapsed(true); }}
        theme="dark"
        style={{ position: 'sticky', top: 0, height: '100vh', zIndex: 10 }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Title level={5} style={{ color: '#fff', margin: 0 }}>
            {collapsed ? '📝' : '📝 Admin Panel'}
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{
          background: token.colorBgContainer,
          padding: isMobile ? '0 12px' : '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 16 }}>
            <Button
              type="text"
              icon={darkMode ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggleTheme}
              title={darkMode ? '切换白天模式' : '切换黑夜模式'}
            />
            {!isMobile && <span style={{ color: token.colorText }}>Welcome, {user?.nickname || user?.username}</span>}
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              danger
            >
              {!isMobile && 'Logout'}
            </Button>
          </div>
        </Header>
        <Content style={{
          margin: isMobile ? 12 : 24,
          padding: isMobile ? 16 : 24,
          background: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
