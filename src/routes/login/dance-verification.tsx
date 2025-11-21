import { createFileRoute } from '@tanstack/react-router';
import { DanceVerificationStep } from '@/pages/AuthenticationPage/steps/DanceVerificationStep';

export const Route = createFileRoute('/login/dance-verification')({
  component: DanceVerificationStep,
});
