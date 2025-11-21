import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StepperProvider, useStepper } from './StepperProvider';

export interface Step {
  id: string;
  title: string;
  description: string;
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {step.title}
          </CardTitle>
          <CardDescription className="text-center">
            {step.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress indicator */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-center text-slate-500">
              Step {currentStep + 1} of {totalSteps}
            </p>
          </div>

          {/* Step content */}
          <div>{step.content}</div>
        </CardContent>
      </Card>
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

