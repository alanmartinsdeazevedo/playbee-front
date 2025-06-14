import type { Metadata } from 'next';
import { DesktopNewReservationView } from '@/views/desktop/reservations/DesktopNewReservationView';

export const metadata: Metadata = {
  title: 'Editar Reserva - PlayBee',
  description: 'Edite os dados de uma reserva existente',
};

export default function EditReservationPage() {
  return <DesktopNewReservationView mode="edit" />;
}