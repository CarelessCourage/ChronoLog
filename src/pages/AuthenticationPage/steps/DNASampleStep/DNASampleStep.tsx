import { useStepper } from '@/components/StepperProvider.tsx';
import { StepperFormBox } from '@/components/StepperFormBox.tsx';
import { useState, useEffect, useRef } from 'react';
import { sendVictorToast } from '@/lib/victor.tsx';
import { Icon } from '@iconify/react';
import { RetroButton } from '@/components/ui/retro-button.tsx';
import { UrineSubStep } from '@/pages/AuthenticationPage/steps/DNASampleStep/UrineSubStep.tsx';
import { useElevenLabs } from '@/lib/elevenlabs';

const VOICE_TEXTS = {
  bloodInitial:
    'System needs a blood sample to verify that you are human. Please apply a blood sample on your reader.',
  bloodFailed: 'Human check unsuccessful. Respond faster next time to prove you are really human.',
  urineInitial:
    'System needs a urine sample to verify that you are human. Please apply a urine sample on your reader.',
};

export function DNASampleStep() {
  const { nextStep } = useStepper();
  const { playPreloaded, preloadVoices, isSpeaking } = useElevenLabs();

  const [subStep, setSubStep] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const [attemptCount, setAttemptCount] = useState(0);
  const [secondSampleFailed, setSecondSampleFailed] = useState(false);
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [hasStartedCountdown, setHasStartedCountdown] = useState(false);
  const hasPreloadedRef = useRef(false);

  // Preload all voice lines when component mounts (only once)
  useEffect(() => {
    if (hasPreloadedRef.current) return;

    const preloadAllVoices = async () => {
      hasPreloadedRef.current = true;
      const textsToPreload = Object.values(VOICE_TEXTS);
      await preloadVoices(textsToPreload);
      setIsPreloaded(true);
    };
    preloadAllVoices();
  }, [preloadVoices]);

  // Play voice when substep changes and preloading is complete
  useEffect(() => {
    if (!isPreloaded) return;

    if (subStep === 0 && attemptCount === 0) {
      playPreloaded(VOICE_TEXTS.bloodInitial);
    } else if (subStep === 1 && attemptCount === 0) {
      playPreloaded(VOICE_TEXTS.bloodFailed);
    } else if (subStep === 2) {
      playPreloaded(VOICE_TEXTS.urineInitial);
    }
  }, [subStep, attemptCount, playPreloaded, isPreloaded]);

  // Start countdown: wait for voice on first attempt, start immediately on retries
  useEffect(() => {
    if (!isPreloaded || subStep !== 0) return;

    // First attempt: wait for voice to finish
    if (attemptCount === 0) {
      if (!isSpeaking && !hasStartedCountdown) {
        setHasStartedCountdown(true);
      }
    } else {
      // Retry: start countdown immediately (no waiting)
      if (!hasStartedCountdown) {
        setHasStartedCountdown(true);
      }
    }
  }, [isPreloaded, isSpeaking, subStep, hasStartedCountdown, attemptCount]);

  useEffect(() => {
    if (subStep === 0 && hasStartedCountdown) {
      // First attempt: 10 seconds total, second+ attempts: 2 seconds total
      const totalDuration = attemptCount === 0 ? 10000 : 2000;
      const tickInterval = totalDuration / 5; // Divide by 5 to get 5 ticks

      const timer = setTimeout(() => {
        setSubStep(1);
        setHasStartedCountdown(false);
      }, totalDuration);

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, tickInterval);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [subStep, attemptCount, hasStartedCountdown]);

  // Reset countdown state when retrying
  useEffect(() => {
    if (subStep === 0 && attemptCount > 0) {
      setCountdown(5);
    }
  }, [subStep, attemptCount]);

  useEffect(() => {
    if (subStep === 2) {
      setTimeout(() => {
        sendVictorToast('DO NOT! urinate on company equipment!! This is an HR violation.', {
          isViolation: false,
        });
      }, 4000);
    }
  }, [subStep]);

  return (
    <StepperFormBox>
      {!isPreloaded && (
        <div className="flex flex-col items-center gap-4">
          <Icon icon="eos-icons:loading" className="text-blue-500" width="48" height="48" />
          <div className="text-center">Loading audio...</div>
        </div>
      )}
      {isPreloaded && subStep === 0 && (
        <>
          <div className="text-center">
            System needs a blood sample to verify that you're human.
            <br /> Please apply a blood sample on your reader.
          </div>
          {attemptCount === 0 && !hasStartedCountdown ? (
            <div className="flex justify-center mt-4">
              <Icon icon="eos-icons:loading" className="text-blue-500" width="32" height="32" />
            </div>
          ) : (
            <div className="text-4xl font-bold mt-4 text-center">{countdown}s</div>
          )}
        </>
      )}
      {isPreloaded && subStep === 1 && (
        <>
          <div className="flex flex-col items-center gap-4">
            <Icon icon="mdi:close-circle" className="text-red-500" width="64" height="64" />
            <div>
              Human check unsuccessful. Respond faster next time to prove you're really human.
            </div>
          </div>
          <div className="flex gap-4 mt-4 justify-end">
            {secondSampleFailed && (
              <RetroButton onClick={() => nextStep()}>Try another another method</RetroButton>
            )}
            {attemptCount >= 1 && (
              <RetroButton onClick={() => setSubStep(2)}>Try another method</RetroButton>
            )}
            <RetroButton
              onClick={() => {
                setAttemptCount((prev) => prev + 1);
                setSubStep(0);
                setHasStartedCountdown(false);
              }}
            >
              Try again
            </RetroButton>
          </div>
        </>
      )}
      {isPreloaded && subStep === 2 && (
        <UrineSubStep
          onTimerExpire={() => {
            setSecondSampleFailed(true);
            setSubStep(1);
          }}
        />
      )}
    </StepperFormBox>
  );
}
