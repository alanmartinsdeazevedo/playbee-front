import type { Metadata } from 'next';
import MobileLogin from '@/views/mobile/login/MobileLogin';

export const metadata: Metadata = {
  title: 'Login - PlayBee',
  description: 'Acesse sua conta PlayBee',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function MobileLoginPage() {
  return <MobileLogin />;
}