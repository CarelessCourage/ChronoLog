import { createContext, useContext, ReactNode } from 'react';
import { useLoginStepper } from '@/hooks/use-login-stepper';
import { usePostIts } from '@/lib/postitContext';
import { getRandomPostItMessage, getRandomPostItColor, getRandomPosition } from '@/lib/postits';

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
  const { addPostIt } = usePostIts();

  const nextStepWithPostIt = () => {
    const currentPath = window.location.pathname;
    
    // Don't add random post-it for reset-password step
    // (credentials change will add the login post-it)
    if (currentPath !== '/login/reset-password') {
      // Add a random post-it note when completing a step
      const position = getRandomPosition();
      addPostIt({
        text: getRandomPostItMessage(),
        color: getRandomPostItColor(),
        ...position,
      });
    }
    
    stepper.nextStep();
  };

  const value: StepperContextValue = {
    ...stepper,
    nextStep: nextStepWithPostIt,
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
