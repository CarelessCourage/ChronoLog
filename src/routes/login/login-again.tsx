import { createFileRoute } from '@tanstack/react-router';
import { LoginAgainStep } from '@/pages/AuthenticationPage/steps/LoginAgainStep';

export const Route = createFileRoute('/login/login-again')({
  component: LoginAgainStep,
});
