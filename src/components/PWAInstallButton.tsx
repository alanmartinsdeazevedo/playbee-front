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
          variant="outlined"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={handleDismiss}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          Instale o PlayBee para uma experiência melhor!
        </Alert>
        
        <Button
          variant="outlined"
          startIcon={<InstallMobileIcon />}
          onClick={handleInstallClick}
          disabled={isInstalling}
          fullWidth
          sx={{
            borderStyle: 'dashed',
            borderColor: 'primary.main',
            color: 'primary.main',
            py: 1.5,
            '&:hover': {
              borderStyle: 'solid',
              backgroundColor: 'primary.main',
              color: 'white',
            },
            '&:disabled': {
              opacity: 0.7,
            }
          }}
        >
          {isInstalling ? 'Instalando...' : 'Instalar PlayBee'}
        </Button>
      </Box>
    </Collapse>
  );
};

export default PWAInstallButton;