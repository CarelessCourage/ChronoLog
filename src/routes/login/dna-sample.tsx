import { createFileRoute } from '@tanstack/react-router';
import { DNASampleStep } from '@/pages/AuthenticationPage/steps/DNASampleStep/DNASampleStep';

export const Route = createFileRoute('/login/dna-sample')({
  component: DNASampleStep,
});
