import type { Metadata } from 'next';
import { DesktopReservationDetailsView } from '@/views/desktop/reservations/DesktopReservationDetailsView';

export const metadata: Metadata = {
  title: 'Detalhes da Reserva - PlayBee',
  description: 'Visualize os detalhes de uma reserva específica',
};

export default function ReservationDetailsPage() {
  return <DesktopReservationDetailsView />;
}