import { createFileRoute } from '@tanstack/react-router';
import { NetworkErrorStep } from '@/pages/AuthenticationPage/steps/NetworkErrorStep';

export const Route = createFileRoute('/login/network-error')({
  component: NetworkErrorStep,
});
