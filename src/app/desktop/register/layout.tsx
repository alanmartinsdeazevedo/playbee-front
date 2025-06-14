import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Registro - PlayBee',
  description: 'Crie sua conta PlayBee',
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}