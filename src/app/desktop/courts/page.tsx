import type { Metadata } from 'next';
import { DesktopCourtsView } from '@/views/desktop/courts/DesktopCourtsView';

export const metadata: Metadata = {
  title: 'Quadras - PlayBee',
  description: 'Gerencie e visualize todas as quadras esportivas disponíveis',
};

export default function DesktopCourtsPage() {
  return <DesktopCourtsView />;
}