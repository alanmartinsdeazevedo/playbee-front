import type { Metadata } from 'next';
import { MobileDashboardView } from '@/views/mobile/dashboard/MobileDashboardView';

export const metadata: Metadata = {
  title: 'Dashboard - PlayBee',
  description: 'Seu painel principal com reservas e quadras disponíveis',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function MobileDashboardPage() {
  return <MobileDashboardView />;
}