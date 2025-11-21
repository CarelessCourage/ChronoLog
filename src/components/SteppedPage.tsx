import { ReactNode } from 'react';
import { Progress } from '@/components/ui/progress';
import { StepperProvider, useStepper } from './StepperProvider';

export interface Step {
  id: string;
  content: ReactNode;
}

interface SteppedPageProps {
  title: string;
  subtitle: string;
  steps: Step[];
  onComplete?: () => void;
}

function SteppedPageContent({ steps }: { steps: Step[] }) {
  const { currentStep, totalSteps, progress } = useStepper();
  const step = steps[currentStep];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Split background */}
      <div className="fixed inset-0 grid grid-cols-[3fr_4fr]">
        <div className="bg-slate-900/5" />
        <div 
          className="bg-cover bg-center"
          style={{ backgroundImage: 'url(/gifs/officeDesk.gif)' }}
        />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Progress indicator at the top */}
        <div className="w-full bg-white/90 backdrop-blur-sm border-b shadow-sm">
          <div className="max-w-4xl mx-auto px-6 py-4 space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-center text-slate-500">
              Step {currentStep + 1} of {totalSteps}
            </p>
          </div>
        </div>

        {/* Step content taking remaining space */}
        {step.content}
      </div>
    </div>
  );
}

export function SteppedPage({ steps, onComplete }: SteppedPageProps) {
  return (
    <StepperProvider totalSteps={steps.length} onComplete={onComplete}>
      <SteppedPageContent steps={steps} />
    </StepperProvider>
  );
}

