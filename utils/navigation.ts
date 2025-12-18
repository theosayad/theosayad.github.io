import { useEffect, useState } from 'react';

const getBasePath = () => {
  const base = import.meta.env.BASE_URL ?? '/';
  return base.endsWith('/') ? base.slice(0, -1) : base;
};

const stripBase = (pathname: string) => {
  const base = getBasePath();
  if (!base || base === '/') return pathname;
  if (pathname === base) return '/';
  return pathname.startsWith(`${base}/`) ? pathname.slice(base.length) : pathname;
};

const withBase = (to: string) => {
  const base = getBasePath();
  if (!base || base === '/') return to;
  if (to === '/') return base || '/';
  return `${base}${to.startsWith('/') ? '' : '/'}${to}`;
};

export const navigate = (to: string) => {
  const url = withBase(to);
  if (url === window.location.pathname + window.location.search + window.location.hash) return;
  window.history.pushState({}, '', url);
  window.dispatchEvent(new Event('app:navigate'));
};

export const useAppLocation = () => {
  const [loc, setLoc] = useState(() => ({
    pathname: stripBase(window.location.pathname || '/'),
    hash: window.location.hash || '',
  }));

  useEffect(() => {
    const onChange = () => {
      setLoc({
        pathname: stripBase(window.location.pathname || '/'),
        hash: window.location.hash || '',
      });
    };
    window.addEventListener('popstate', onChange);
    window.addEventListener('hashchange', onChange);
    window.addEventListener('app:navigate', onChange as EventListener);
    return () => {
      window.removeEventListener('popstate', onChange);
      window.removeEventListener('hashchange', onChange);
      window.removeEventListener('app:navigate', onChange as EventListener);
    };
  }, []);

  return loc;
};

