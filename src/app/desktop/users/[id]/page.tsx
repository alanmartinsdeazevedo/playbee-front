import type { Metadata } from 'next';
import { DesktopUserDetailsView } from '@/views/desktop/users/DesktopUserDetailsView';

export const metadata: Metadata = {
  title: 'Detalhes do Usuário - PlayBee',
  description: 'Visualize informações completas e estatísticas do usuário',
};

export default function UserDetailsPage() {
  return <DesktopUserDetailsView />;
}