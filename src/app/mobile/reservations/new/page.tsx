import type { Metadata } from 'next';
import { MobileNewReservationView } from '@/views/mobile/reservations/MobileNewReservationView';

export const metadata: Metadata = {
  title: 'Nova Reserva - PlayBee',
  description: 'Agende o uso de uma quadra esportiva',
};

export default function MobileNewReservationPage() {
  return <MobileNewReservationView />;
}