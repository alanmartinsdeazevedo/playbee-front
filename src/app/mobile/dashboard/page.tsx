import type { Metadata, Viewport } from 'next';
import { MobileDashboardView } from '@/views/mobile/dashboard/MobileDashboardView';

export const metadata: Metadata = {
  title: 'Dashboard - PlayBee',
  description: 'Seu painel principal com reservas e quadras disponíveis',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function MobileDashboardPage() {
  return <MobileDashboardView />;
}