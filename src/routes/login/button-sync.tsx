import { createFileRoute } from '@tanstack/react-router';
import { ButtonSyncStep } from '@/pages/AuthenticationPage/steps/ButtonSyncStep';

export const Route = createFileRoute('/login/button-sync')({
  component: ButtonSyncStep,
});
