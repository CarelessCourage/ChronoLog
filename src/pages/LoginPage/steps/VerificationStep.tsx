import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStepper } from '@/components/StepperProvider';

export function VerificationStep() {
  const [code, setCode] = useState('');
  const { nextStep, previousStep, isLastStep } = useStepper();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="verification">Verification Code</Label>
        <Input
          id="verification"
          type="text"
          placeholder="123456"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          autoFocus
        />
        <p className="text-xs text-slate-500">
          Enter the 6-digit code sent to your email
        </p>
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={previousStep} className="flex-1">
          Back
        </Button>
        <Button type="submit" className="flex-1">
          {isLastStep ? 'Complete' : 'Continue'}
        </Button>
      </div>
    </form>
  );
}

