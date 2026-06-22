import client from './client';

export function fetchProfile() {
  return client.get('/profile');
}
