import type { Metadata } from 'next';
import { DesktopRegisterView } from '@/views/desktop/register/DesktopRegisterView';

export const metadata: Metadata = {
  title: 'Registro - PlayBee',
  description: 'Crie sua conta PlayBee para reservar quadras esportivas',
};

export default function DesktopRegisterPage() {
  return <DesktopRegisterView />;
}