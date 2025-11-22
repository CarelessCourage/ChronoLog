import { createFileRoute } from '@tanstack/react-router';
import { DrawSelfPortraitStep } from '@/pages/AuthenticationPage/steps/DrawSelfPortraitStep';

export const Route = createFileRoute('/login/draw-self-portrait')({
  component: DrawSelfPortraitStep,
});
