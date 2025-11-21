import { createContext, useContext, useState, ReactNode } from 'react';

interface StepperContextValue {
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  progress: number;
}

const StepperContext = createContext<StepperContextValue | null>(null);

interface StepperProviderProps {
  children: ReactNode;
  totalSteps: number;
  initialStep?: number;
  onComplete?: () => void;
}

export function StepperProvider({ 
  children, 
  totalSteps, 
  initialStep = 0,
  onComplete 
}: StepperProviderProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else if (onComplete) {
      onComplete();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  };

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const value: StepperContextValue = {
    currentStep,
    totalSteps,
    nextStep,
    previousStep,
    goToStep,
    isFirstStep,
    isLastStep,
    progress,
  };

  return (
    <StepperContext.Provider value={value}>
      {children}
    </StepperContext.Provider>
  );
}

export function useStepper() {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error('useStepper must be used within a StepperProvider');
  }
  return context;
}

