import { createContext, useContext, ReactNode } from 'react';
import { useLoginStepper } from '@/hooks/use-login-stepper';

interface StepperContextValue {
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number | string) => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  progress: number;
}

const StepperContext = createContext<StepperContextValue | null>(null);

interface StepperProviderProps {
  children: ReactNode;
  totalSteps?: number;
  initialStep?: number;
  onComplete?: () => void;
}

export function StepperProvider({ children }: StepperProviderProps) {
  // Use the URL-based stepper for login flow
  const stepper = useLoginStepper();

  const value: StepperContextValue = {
    ...stepper,
    goToStep: (step: number | string) => {
      if (typeof step === 'string') {
        stepper.goToStep(step);
      }
    },
  };

  return <StepperContext.Provider value={value}>{children}</StepperContext.Provider>;
}

export function useStepper() {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error('useStepper must be used within a StepperProvider');
  }
  return context;
}
