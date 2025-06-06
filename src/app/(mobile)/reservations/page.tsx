import type { Metadata } from 'next';
import { MobileReservationsView } from '@/views/mobile/reservations/MobileReservationsView';

export const metadata: Metadata = {
  title: 'Reservas - PlayBee',
  description: 'Gerencie suas reservas',
};

export default function MobileReservationsPage() {
  return <MobileReservationsView />;
}