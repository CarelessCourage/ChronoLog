import { useStepper } from '@/components/StepperProvider';
import {StepperFormBox} from "@/components/StepperFormBox.tsx";

export function PasswordStep() {
  const { nextStep, previousStep } = useStepper();


  return (
    <StepperFormBox>Password</StepperFormBox>
  );
}

