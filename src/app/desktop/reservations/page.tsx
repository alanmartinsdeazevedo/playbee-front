import type { Metadata } from 'next';
import { DesktopReservationsView } from '@/views/desktop/reservations/DesktopReservationsView';

export const metadata: Metadata = {
  title: 'Reservas - PlayBee',
  description: 'Gerencie todas as reservas do sistema',
};

export default function DesktopReservationsPage() {
  return <DesktopReservationsView />;
}