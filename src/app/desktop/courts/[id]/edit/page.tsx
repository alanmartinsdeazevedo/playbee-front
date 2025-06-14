import type { Metadata } from 'next';
import { DesktopNewCourtView } from '@/views/desktop/courts/DesktopNewCourtView';

export const metadata: Metadata = {
  title: 'Editar Quadra - PlayBee',
  description: 'Edite as informações da quadra esportiva',
};

export default function EditCourtPage() {
  return <DesktopNewCourtView mode="edit" />;
}