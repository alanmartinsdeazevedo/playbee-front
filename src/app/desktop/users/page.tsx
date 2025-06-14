import type { Metadata } from 'next';
import { DesktopUsersView } from '@/views/desktop/users/DesktopUsersView';

export const metadata: Metadata = {
  title: 'Usuários - PlayBee',
  description: 'Gerencie todos os usuários do sistema',
};

export default function DesktopUsersPage() {
  return <DesktopUsersView />;
}