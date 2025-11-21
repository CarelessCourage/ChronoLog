import { createFileRoute } from '@tanstack/react-router';
import { BinaryQuestionStep } from '@/pages/AuthenticationPage/steps/BinaryQuestionStep';

export const Route = createFileRoute('/login/binary-question')({
  component: BinaryQuestionStep,
});
