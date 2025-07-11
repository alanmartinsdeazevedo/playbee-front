'use client'

import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showDismiss, setShowDismiss] = useState(true);

  useEffect(() => {
    // Verifica se já está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    
    if (isStandalone || isInWebAppiOS) {
      setShowInstallButton(false);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA: beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    const handleAppInstalled = () => {
      console.log('PWA: App foi instalado com sucesso');
      setShowInstallButton(false);
      setDeferredPrompt(null);
      setIsInstalling(false);
    };

    // Event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('PWA: Prompt não disponível');
      return;
    }

    setIsInstalling(true);

    try {
      // Mostra o prompt de instalação
      await deferredPrompt.prompt();

      // Aguarda a escolha do usuário
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`PWA: Usuário ${outcome === 'accepted' ? 'aceitou' : 'rejeitou'} a instalação`);

      if (outcome === 'accepted') {
        setShowInstallButton(false);
      }
    } catch (error) {
      console.error('PWA: Erro durante instalação:', error);
    } finally {
      setDeferredPrompt(null);
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowDismiss(false);
    setShowInstallButton(false);
  };

  if (!showInstallButton || !showDismiss) {
    return null;
  }

  return (
    <Collapse in={showInstallButton && showDismiss}>
      <Box sx={{ mb: 3 }}>
        <Alert
          severity="info"
          variant="filled"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={handleDismiss}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ 
            mb: 2,
            backgroundColor: 'info.main',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white',
            }
          }}
        >
          Instale o PlayBee para uma experiência melhor!
        </Alert>
        
        <Button
          variant="contained"
          startIcon={<InstallMobileIcon />}
          onClick={handleInstallClick}
          disabled={isInstalling}
          fullWidth
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
            border: '2px solid transparent',
            '&:hover': {
              backgroundColor: 'primary.dark',
              boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
              transform: 'translateY(-1px)',
            },
            '&:disabled': {
              opacity: 0.7,
              transform: 'none',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          {isInstalling ? 'Instalando...' : 'Instalar PlayBee'}
        </Button>
      </Box>
    </Collapse>
  );
};

export default PWAInstallButton;