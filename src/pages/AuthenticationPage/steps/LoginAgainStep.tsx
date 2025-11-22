import { useStepper } from '@/components/StepperProvider';
import { StepperFormBox } from '@/components/StepperFormBox.tsx';
import { Input } from '@/components/ui/input';
import { RetroButton } from '@/components/ui/retro-button';
import { useState, useRef } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { credentials } from '@/lib/credentials';
import { sendVictorToast } from '@/lib/victor';

// Fewer interruption messages
const INTERRUPTION_MESSAGES = [
  'Your session will expire soon!',
  'Security alert: Please verify your identity',
  'System message: Authentication in progress',
];

export function LoginAgainStep() {
  const { nextStep } = useStepper();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  // Less frequent character-based interruptions (higher threshold)
  const charCountRef = useRef(0);
  const thresholdRef = useRef(Math.floor(Math.random() * 5) + 8); // Random threshold between 8-12

  // Track the previously focused element
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  const triggerInterruption = () => {
    // Store the currently focused element before blur
    if (document.activeElement instanceof HTMLElement) {
      previouslyFocusedElementRef.current = document.activeElement;
      document.activeElement.blur();
    }

    // Show random alert message
    const randomMessage =
      INTERRUPTION_MESSAGES[Math.floor(Math.random() * INTERRUPTION_MESSAGES.length)];
    setDialogMessage(randomMessage);
    setIsDialogOpen(true);

    // Reset counter and set new random threshold
    charCountRef.current = 0;
    thresholdRef.current = Math.floor(Math.random() * 5) + 8; // New threshold between 8-12
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    // Restore focus to the previously focused element
    setTimeout(() => {
      if (previouslyFocusedElementRef.current) {
        previouslyFocusedElementRef.current.focus();
        previouslyFocusedElementRef.current = null;
      }
    }, 0);
  };

  const handleInputChange = (setter: (value: string) => void, value: string) => {
    setter(value);

    // Increment character count
    charCountRef.current += 1;

    // Check if we've reached the threshold
    if (charCountRef.current >= thresholdRef.current) {
      triggerInterruption();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    sendVictorToast('Pasting is prohibited for security purposes.', {
      channel: '#security-violations',
      isViolation: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (credentials.validate(username, password)) {
      nextStep();
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <>
      <StepperFormBox
        title="Login With New Password"
        description="Please login again with your new password to continue."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => handleInputChange(setUsername, e.target.value)}
              onPaste={handlePaste}
              autoComplete="off"
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              id="password"
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => handleInputChange(setPassword, e.target.value)}
              onPaste={handlePaste}
              autoComplete="off"
              required
            />
          </div>
          {error && <div className="text-sm text-red-600 font-medium">{error}</div>}
          <RetroButton type="submit" className="w-full">
            OK
          </RetroButton>
        </form>

        <AlertDialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>System Notification</AlertDialogTitle>
              <AlertDialogDescription>{dialogMessage}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction autoFocus onClick={handleDialogClose}>
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </StepperFormBox>
    </>
  );
}
