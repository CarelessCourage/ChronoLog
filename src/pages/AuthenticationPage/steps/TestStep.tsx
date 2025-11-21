import { useStepper } from '@/components/StepperProvider';
import {StepperFormBox} from "@/components/StepperFormBox.tsx";

export function TestStep() {
  const {  } = useStepper();


  return (
      <StepperFormBox>
<div>testing</div>
<div>testing</div>
<div>testing</div>
      </StepperFormBox>
  );
}

