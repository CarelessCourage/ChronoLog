import { createFileRoute } from '@tanstack/react-router';
import { TimePage } from '@/pages/TimePage';

export const Route = createFileRoute('/time')({
  component: TimePage,
});
