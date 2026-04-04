import { useState, useCallback, useEffect } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!sessionStorage.getItem('apiKey');
  });

  const login = useCallback((apiKey: string) => {
    sessionStorage.setItem('apiKey', apiKey);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('apiKey');
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, [logout]);

  return {
    isAuthenticated,
    login,
    logout,
  };
}
