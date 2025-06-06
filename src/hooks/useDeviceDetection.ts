'use client';

import { useState, useEffect } from 'react';

export const useDeviceDetection = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkDevice = () => {
      // Verificar user agent
      const userAgent = navigator.userAgent;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileUA = mobileRegex.test(userAgent);
      
      // Verificar viewport
      const isMobileViewport = window.innerWidth <= 768;
      
      // Considera mobile se for detectado pelo UA ou se o viewport for pequeno
      setIsMobile(isMobileUA || isMobileViewport);
      setIsLoading(false);
    };

    checkDevice();

    // Listener para mudanças de tamanho da tela
    const handleResize = () => {
      const isMobileViewport = window.innerWidth <= 768;
      const userAgent = navigator.userAgent;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileUA = mobileRegex.test(userAgent);
      
      setIsMobile(isMobileUA || isMobileViewport);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile, isLoading };
};