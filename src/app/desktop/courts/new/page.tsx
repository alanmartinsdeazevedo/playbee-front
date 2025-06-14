import type { Metadata } from 'next';
import { DesktopNewCourtView } from '@/views/desktop/courts/DesktopNewCourtView';

export const metadata: Metadata = {
  title: 'Nova Quadra - PlayBee',
  description: 'Cadastre uma nova quadra esportiva',
};

export default function DesktopNewCourtPage() {
  return <DesktopNewCourtView />;
}