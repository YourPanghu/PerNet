import client from './client';

export function fetchArticles(page = 1, size = 10, categoryId = undefined, tagId = undefined) {
  const params = { page, size };
  if (categoryId) params.categoryId = categoryId;
  if (tagId) params.tagId = tagId;
  return client.get('/articles', { params });
}

export function fetchArticle(id) {
  return client.get(`/articles/${id}`);
}

export function incrementArticleView(id) {
  return client.post(`/articles/${id}/view`);
}

export function searchArticles(keyword, page = 1, size = 10, categoryId = undefined, tagId = undefined) {
  const params = { keyword, page, size };
  if (categoryId) params.categoryId = categoryId;
  if (tagId) params.tagId = tagId;
  return client.get('/articles/search', { params });
}

export function adminFetchArticles(page = 1, size = 10, keyword = '') {
  const params = { page, size };
  if (keyword) params.keyword = keyword;
  return client.get('/admin/articles', { params });
}

export function adminFetchArticle(id) {
  return client.get(`/admin/articles/${id}`);
}

export function createArticle(data) {
  return client.post('/admin/articles', data);
}

export function updateArticle(id, data) {
  return client.put(`/admin/articles/${id}`, data);
}

export function deleteArticle(id) {
  return client.delete(`/admin/articles/${id}`);
}
