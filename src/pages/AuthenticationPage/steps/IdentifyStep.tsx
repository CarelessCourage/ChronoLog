import { useStepper } from '@/components/StepperProvider';
import {StepperFormBox} from "@/components/StepperFormBox.tsx";

export function IdentifyStep() {
  const {  } = useStepper();


  return (
      <StepperFormBox>
          Identify
      </StepperFormBox>
  );
}

