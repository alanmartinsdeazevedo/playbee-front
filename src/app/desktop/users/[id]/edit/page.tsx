import type { Metadata } from 'next';
import { DesktopNewUserView } from '@/views/desktop/users/DesktopNewUserView';

export const metadata: Metadata = {
  title: 'Editar Usuário - PlayBee',
  description: 'Edite as informações do usuário',
};

export default function EditUserPage() {
  return <DesktopNewUserView mode="edit" />;
}