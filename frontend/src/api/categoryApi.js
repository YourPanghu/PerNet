import client from './client';

export function fetchCategories() {
  return client.get('/categories');
}

// Admin
export function adminFetchCategories() {
  return client.get('/admin/categories');
}

export function adminCreateCategory(data) {
  return client.post('/admin/categories', data);
}

export function adminUpdateCategory(id, data) {
  return client.put(`/admin/categories/${id}`, data);
}

export function adminDeleteCategory(id) {
  return client.delete(`/admin/categories/${id}`);
}
