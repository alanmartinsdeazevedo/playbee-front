import type { Metadata } from 'next';
import { DesktopNewReservationView } from '@/views/desktop/reservations/DesktopNewReservationView';

export const metadata: Metadata = {
  title: 'Nova Reserva - PlayBee',
  description: 'Agende o uso de uma quadra esportiva',
};

export default function DesktopNewReservationPage() {
  return <DesktopNewReservationView />;
}