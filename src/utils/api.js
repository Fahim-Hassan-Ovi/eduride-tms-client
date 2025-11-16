export async function apiFetch(url, options = {}) {
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
  const headers = options.headers || {};
  const token = localStorage.getItem('tms_token') || '';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  return fetch(fullUrl, { ...options, headers });
}


