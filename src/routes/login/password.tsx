import { createFileRoute } from '@tanstack/react-router';
import { PasswordStep } from '@/pages/AuthenticationPage/steps/PasswordStep';

export const Route = createFileRoute('/login/password')({
  component: PasswordStep,
});
