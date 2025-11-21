import { useNavigate } from '@tanstack/react-router';
import { storage } from '@/lib/storage';
import { SteppedPage } from '@/components/SteppedPage';
import { loginSteps } from './steps';

export function StepperPage() {
  const navigate = useNavigate();

  const handleComplete = () => {
    storage.auth.login();
    navigate({ to: '/time', replace: true });
  };

  return (
    <SteppedPage 
      title="ChronoLog"
      subtitle="Time Compliance Portal"
      steps={loginSteps}
      onComplete={handleComplete}
    />
  );
}

