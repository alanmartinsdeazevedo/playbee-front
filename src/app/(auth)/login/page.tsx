import type { Metadata } from 'next';
import Login from '@/views/login/Login';

export const metadata: Metadata = {
  title: 'Login - PlayBee',
  description: 'Faça login na sua conta PlayBee para reservar quadras esportivas',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Login - PlayBee',
    description: 'Acesse sua conta e reserve quadras esportivas',
    type: 'website',
    locale: 'pt_BR',
  },
};

const LoginPage = () => {
  return <Login />;
};

export default LoginPage;