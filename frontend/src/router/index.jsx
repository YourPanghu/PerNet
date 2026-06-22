import { createBrowserRouter } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import HomePage from '../pages/public/HomePage';
import ArticleDetailPage from '../pages/public/ArticleDetailPage';
import SearchResultPage from '../pages/public/SearchResultPage';
import LoginPage from '../pages/admin/LoginPage';
import DashboardPage from '../pages/admin/DashboardPage';
import ArticleCreatePage from '../pages/admin/ArticleCreatePage';
import ArticleEditPage from '../pages/admin/ArticleEditPage';
import BlogProfilePage from '../pages/admin/BlogProfilePage';
import CategoryManagePage from '../pages/admin/CategoryManagePage';
import TagManagePage from '../pages/admin/TagManagePage';
import NotFoundPage from '../pages/NotFoundPage';

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/articles/:id', element: <ArticleDetailPage /> },
      { path: '/search', element: <SearchResultPage /> },
    ],
  },
  {
    path: '/admin/login',
    element: <LoginPage />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'articles/new', element: <ArticleCreatePage /> },
      { path: 'articles/:id/edit', element: <ArticleEditPage /> },
      { path: 'profile', element: <BlogProfilePage /> },
      { path: 'categories', element: <CategoryManagePage /> },
      { path: 'tags', element: <TagManagePage /> },
    ],
  },
  { path: '*', element: <PublicLayout><NotFoundPage /></PublicLayout> },
]);

export default router;
