import client from './client';

export function login(username, password) {
  return client.post('/auth/login', { username, password });
}

export function logout() {
  return client.post('/auth/logout');
}
