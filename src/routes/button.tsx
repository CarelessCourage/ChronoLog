import { createFileRoute } from '@tanstack/react-router';
import { ButtonPage } from '@/pages/ButtonPage';

export const Route = createFileRoute('/button')({
  component: ButtonPage,
});
