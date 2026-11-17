/* ═══════════════════════════════════════
   SPA Hash Router (100% Synchronous Instant Render)
   ═══════════════════════════════════════ */

const routes = {};
let currentRoute = null;

export function registerRoute(path, handler) {
  routes[path] = handler;
}

export function navigateTo(path) {
  window.location.hash = '#' + path;
}

export const navigate = navigateTo;

export function getCurrentPath() {
  const hash = window.location.hash.slice(1);
  return (hash.startsWith('/') ? hash : '/' + hash) || '/';
}

let activeRouteChangeCallback = null;

export function refreshCurrentRoute() {
  const path = getCurrentPath();
  currentRoute = path;
  const handler = routes[path] || routes['/'];
  const content = document.getElementById('content');
  if (content && handler) {
    try {
      handler(content);
    } catch (err) {
      console.error('Error rendering route:', err);
    }
  }
  if (activeRouteChangeCallback) activeRouteChangeCallback(path);
}

export function startRouter(onRouteChange) {
  activeRouteChangeCallback = onRouteChange;
  function handleRoute() {
    refreshCurrentRoute();
  }

  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
