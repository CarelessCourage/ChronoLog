import { toast } from '@/hooks/use-toast';
import { VictorToastContent } from '@/components/VictorToast';
import { addViolation, getViolationCount, isFired } from '@/lib/violations';

interface VictorToastOptions {
  channel?: string;
  timestamp?: string;
  duration?: number;
  isViolation?: boolean;
}

export function sendVictorToast(message: string, options?: VictorToastOptions) {
  let currentViolations = getViolationCount();

  if (options?.isViolation) {
    currentViolations = addViolation();

    if (isFired()) {
      // Redirect to fired page after a short delay
      setTimeout(() => {
        window.location.href = '/fired';
      }, 3000);
    }
  }

  toast({
    variant: 'slack',
    duration: options?.duration ?? 7000,
    className:
      'flex-col items-stretch space-x-0 gap-4 rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.25)]',
    description: (
      <VictorToastContent
        message={message}
        channel={options?.channel}
        timestamp={options?.timestamp}
        isViolation={options?.isViolation}
        violationCount={currentViolations}
      />
    ),
  });
}
