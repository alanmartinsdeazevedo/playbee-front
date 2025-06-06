import type { Metadata } from 'next';
import { MobileDashboardLayout } from '@/components/layout/MobileDashboardLayout';

export const metadata: Metadata = {
  title: 'Dashboard - PlayBee',
  description: 'Seus agendamentos e quadras',
};

export default function MobileDashboardLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MobileDashboardLayout>{children}</MobileDashboardLayout>;
}