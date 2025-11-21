import { createFileRoute } from '@tanstack/react-router';
import { FiredPage } from '@/pages/FiredPage';

export const Route = createFileRoute('/fired')({
  component: FiredPage,
});
