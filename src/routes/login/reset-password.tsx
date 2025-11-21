import { createFileRoute } from '@tanstack/react-router';
import { ResetPasswordStep } from '@/pages/AuthenticationPage/steps/ResetPasswordState';

export const Route = createFileRoute('/login/reset-password')({
  component: ResetPasswordStep,
});
