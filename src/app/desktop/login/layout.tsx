import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - PlayBee',
  description: 'Faça login na sua conta PlayBee para reservar quadras esportivas',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}