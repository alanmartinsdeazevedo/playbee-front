import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nova Reserva - PlayBee',
  description: 'Agende o uso de uma quadra esportiva',
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}