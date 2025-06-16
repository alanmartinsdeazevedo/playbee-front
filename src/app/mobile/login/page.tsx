import type { Metadata, Viewport } from 'next';
import MobileLogin from '@/views/mobile/login/MobileLogin';

export const metadata: Metadata = {
  title: 'Login - PlayBee',
  description: 'Acesse sua conta PlayBee',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function MobileLoginPage() {
  return <MobileLogin />;
}