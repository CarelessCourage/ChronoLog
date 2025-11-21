import { useStepper } from '@/components/StepperProvider';
import {StepperFormBox} from "@/components/StepperFormBox.tsx";

export function CaptchaStep() {
  const { nextStep, previousStep, isLastStep } = useStepper();

  return (
    <StepperFormBox>Captcha</StepperFormBox>
  );
}

