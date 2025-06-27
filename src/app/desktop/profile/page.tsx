import type { Metadata } from 'next';
import { DesktopProfileView } from '@/views/desktop/profile/DesktopProfileView';

export const metadata: Metadata = {
  title: 'Perfil - PlayBee',
  description: 'Seu perfil e configurações',
};

export default function DesktopProfilePage() {
  return <DesktopProfileView />;
}