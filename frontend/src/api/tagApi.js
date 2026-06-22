import client from './client';

export function fetchTags() {
  return client.get('/tags');
}

// Admin
export function adminFetchTags() {
  return client.get('/admin/tags');
}

export function adminCreateTag(data) {
  return client.post('/admin/tags', data);
}

export function adminUpdateTag(id, data) {
  return client.put(`/admin/tags/${id}`, data);
}

export function adminDeleteTag(id) {
  return client.delete(`/admin/tags/${id}`);
}
