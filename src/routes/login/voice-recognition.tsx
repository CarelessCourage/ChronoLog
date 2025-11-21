import { createFileRoute } from '@tanstack/react-router';
import { VoiceRecognition } from '@/pages/AuthenticationPage/steps/VoiceRecognition';

export const Route = createFileRoute('/login/voice-recognition')({
  component: VoiceRecognition,
});
