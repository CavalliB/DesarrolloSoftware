
const trimSlash = (s) => (s ? s.replace(/\/+$/, "") : s);

export const SOCKET_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SOCKET_URL)
  ? trimSlash(import.meta.env.VITE_SOCKET_URL)
  : (typeof window !== 'undefined'
    ? `${window.location.protocol === 'https:' ? 'https' : 'http'}://${window.location.hostname}:5000`
    : 'https://potential-space-spork-g9x9j5q7jp5f976g-5000.app.github.dev');

export const API_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? trimSlash(import.meta.env.VITE_API_URL)
  : 'https://potential-space-spork-g9x9j5q7jp5f976g-5000.app.github.dev';

export default {
  SOCKET_URL,
  API_URL,
};
