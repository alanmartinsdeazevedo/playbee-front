import type { Metadata } from 'next';
import { DesktopNewCourtView } from '@/views/desktop/courts/DesktopNewCourtView';
import { RoleGuard } from '@/components/auth/RoleGuard';

export const metadata: Metadata = {
  title: 'Nova Quadra - PlayBee',
  description: 'Cadastre uma nova quadra esportiva',
};

export default function DesktopNewCourtPage() {
  return (
    <RoleGuard requiredRole="ADMIN" redirectTo="/desktop/courts">
      <DesktopNewCourtView />
    </RoleGuard>
  );
}