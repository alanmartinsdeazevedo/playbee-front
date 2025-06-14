import type { Metadata } from 'next';
import { DesktopNewUserView } from '@/views/desktop/users/DesktopNewUserView';

export const metadata: Metadata = {
  title: 'Novo Usuário - PlayBee',
  description: 'Cadastre um novo usuário no sistema',
};

export default function DesktopNewUserPage() {
  return <DesktopNewUserView />;
}