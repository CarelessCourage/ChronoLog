import { useNavigate } from '@tanstack/react-router';
import { storage } from '@/lib/storage';
import { useEffect } from 'react';
import { getRandomPostItMessage, getRandomPostItColor, getRandomPosition } from '@/lib/postits';
import { credentials } from '@/lib/credentials';

// Define the login step order
const LOGIN_STEPS = [
  '/login/password',
  '/login/reset-password',
  '/login/login-again',
  '/login/voice-recognition',
  '/login/dna-sample',
  '/login/dance-verification',
  '/login/button-sync',
  '/login/binary-question',
  '/login/network-error',
] as const;

export function useLoginStepper() {
  const navigate = useNavigate();

  const getCurrentStepIndex = () => {
    const currentPath = window.location.pathname;
    return LOGIN_STEPS.indexOf(currentPath as any);
  };

  const nextStep = () => {
    const currentIndex = getCurrentStepIndex();

    if (currentIndex === -1) {
      // Not on a login step, go to first step
      navigate({ to: LOGIN_STEPS[0] });
      return;
    }

    if (currentIndex < LOGIN_STEPS.length - 1) {
      // Go to next step
      navigate({ to: LOGIN_STEPS[currentIndex + 1] });
    } else {
      // Last step completed - log in and go to time page
      storage.auth.login();
      navigate({ to: '/time', replace: true });
    }
  };

  const previousStep = () => {
    const currentIndex = getCurrentStepIndex();

    if (currentIndex > 0) {
      navigate({ to: LOGIN_STEPS[currentIndex - 1] });
    }
  };

  const goToStep = (stepPath: string) => {
    if (LOGIN_STEPS.includes(stepPath as any)) {
      navigate({ to: stepPath });
    }
  };

  // Secret keyboard shortcut: Cmd/Ctrl + ArrowRight to skip step
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'ArrowRight') {
        event.preventDefault();

        // Add a random post-it note when skipping
        const position = getRandomPosition();
        const postItEvent = new CustomEvent('addPostIt', {
          detail: {
            text: getRandomPostItMessage(),
            color: getRandomPostItColor(),
            ...position,
          },
        });
        window.dispatchEvent(postItEvent);

        // Special handling for reset-password step
        const currentPath = window.location.pathname;
        if (currentPath === '/login/reset-password') {
          // Set a generic password when skipping reset-password
          const newPassword = 'NewPass123!';
          const newEmail = `worker${Math.floor(Math.random() * 9000) + 1000}@chronolog.corp`;
          credentials.setIdentity(newEmail, newPassword);
          credentials.resetResetAttempts();
        }

        nextStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const currentIndex = getCurrentStepIndex();
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === LOGIN_STEPS.length - 1;
  const progress = currentIndex >= 0 ? ((currentIndex + 1) / LOGIN_STEPS.length) * 100 : 0;

  return {
    currentStep: currentIndex >= 0 ? currentIndex : 0,
    totalSteps: LOGIN_STEPS.length,
    nextStep,
    previousStep,
    goToStep,
    isFirstStep,
    isLastStep,
    progress,
  };
}
