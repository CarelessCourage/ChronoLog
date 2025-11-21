import { useStepper } from '@/components/StepperProvider.tsx';
import {StepperFormBox} from "@/components/StepperFormBox.tsx";
import { useState, useEffect } from "react";
import {sendVictorToast} from "@/lib/victor.tsx";
import { Icon } from '@iconify/react';
import {Button} from "@/components/ui/button.tsx";
import {UrineSubStep} from "@/pages/AuthenticationPage/steps/DNASampleStep/UrineSubStep.tsx";

export function DNASampleStep() {
  const { nextStep } = useStepper();

    const [subStep, setSubStep] = useState(0);
    const [countdown, setCountdown] = useState(5);
    const [attemptCount, setAttemptCount] = useState(0);
    const [secondSampleFailed, setSecondSampleFailed] = useState(false);

    useEffect(() => {
        if (subStep === 0) {
            // First attempt: 5 seconds total, second+ attempts: 2 seconds total
            const totalDuration = attemptCount === 0 ? 5000 : 2000;
            const tickInterval = totalDuration / 5; // Divide by 5 to get 5 ticks

            const timer = setTimeout(() => {
                setSubStep(1);
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
    }, [subStep, attemptCount]);

    useEffect(() => {
        if(subStep === 2) {
            setTimeout(() => {
                sendVictorToast('DO NOT! urinate on company equipment!! This is an HR violation.')
            }, 4000)
        }
    }, [subStep]);

    return (
      <StepperFormBox>
          {subStep === 0 && (
              <>
                  <div className='text-center'>
                      System needs a blood sample to verify that you're human.<br /> Please enter a blood sample on your reader.
                  </div>
                  <div className="text-4xl font-bold mt-4 text-center">
                      {countdown}s
                  </div>
              </>
          )}
          {subStep === 1 && (
              <>
                  <div className="flex flex-col items-center gap-4">
                      <Icon icon="mdi:close-circle" className="text-red-500" width="64" height="64" />
                      <div>
                          Human check unsuccessful. Respond faster next time to prove you're really human.
                      </div>
                  </div>
                  <div className="flex gap-4 mt-4 justify-end">
                      {secondSampleFailed && (
                          <Button onClick={() => nextStep()}>Try another another method</Button>
                      )}
                      {attemptCount >= 1 && (
                          <Button onClick={() => setSubStep(2)}>Try another method</Button>
                      )}
                      <Button onClick={() => {
                          setCountdown(5);
                          setAttemptCount(prev => prev + 1);
                          setSubStep(0);
                      }}>Try again</Button>
                  </div>
              </>
          )}
          {subStep === 2 && (
              <UrineSubStep onTimerExpire={() => {
                  setSecondSampleFailed(true);
                  setSubStep(1);
              }} />
          )}
      </StepperFormBox>
  );
}

