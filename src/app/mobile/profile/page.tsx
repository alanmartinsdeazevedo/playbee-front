import type { Metadata } from 'next';
import { MobileProfileView } from '@/views/mobile/profile/MobileProfileView';

export const metadata: Metadata = {
  title: 'Perfil - PlayBee',
  description: 'Seu perfil e configurações',
};

export default function MobileProfilePage() {
  return <MobileProfileView />;
}