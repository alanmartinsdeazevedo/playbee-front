import type { Metadata } from 'next';
import { DesktopNewCourtView } from '@/views/desktop/courts/DesktopNewCourtView';
import { RoleGuard } from '@/components/auth/RoleGuard';

export const metadata: Metadata = {
  title: 'Editar Quadra - PlayBee',
  description: 'Edite as informações da quadra esportiva',
};

export default function EditCourtPage() {
  return (
    <RoleGuard requiredRole="ADMIN" redirectTo="/desktop/courts">
      <DesktopNewCourtView mode="edit" />
    </RoleGuard>
  );
}