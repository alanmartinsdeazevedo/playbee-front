import type { Metadata } from 'next';
import { MobileCourtsView } from '@/views/mobile/courts/MobileCourtsView';

export const metadata: Metadata = {
  title: 'Quadras - PlayBee',
  description: 'Veja todas as quadras disponíveis',
};

export default function MobileCourtsPage() {
  return <MobileCourtsView />;
}