'use client';

import { useState, useEffect } from 'react';
import { AuthService } from '@/lib/auth';
import type { User } from '@/types/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = AuthService.getUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, senha: string) => {
    const user = await AuthService.login(email, senha);
    setUser(user);
    return user;
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
};