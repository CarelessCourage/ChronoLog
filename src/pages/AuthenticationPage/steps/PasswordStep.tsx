import { useStepper } from '@/components/StepperProvider';
import { StepperFormBox } from '@/components/StepperFormBox.tsx';
import { Input } from '@/components/ui/input';
import { RetroButton } from '@/components/ui/retro-button';
import { useState, useRef, useEffect } from 'react';
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
import { useBackgroundMusic } from '@/lib/backgroundMusic';

// Random interruption messages
const INTERRUPTION_MESSAGES = [
  'Your session will expire soon!',
  'New notification: Please verify your identity',
  'Reminder: Update your security settings',
  'You have unread messages',
  'Security alert: Unusual login attempt detected',
  'System message: Please complete verification',
  'Action required: Confirm your email address',
  'Important: Review your account settings',
  'Nononono 🙂‍↔️',
];

export function PasswordStep() {
  const { nextStep } = useStepper();
  const { startMusic } = useBackgroundMusic();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  // Start background music when component mounts
  useEffect(() => {
    startMusic();
  }, [startMusic]);

  // Character-based interruption tracking
  const charCountRef = useRef(0);
  const thresholdRef = useRef(Math.floor(Math.random() * 3) + 2); // Random threshold between 2-4

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
    thresholdRef.current = Math.floor(Math.random() * 5) + 2; // New threshold between 2-4
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (credentials.validate(username, password)) {
      // Second time with correct credentials, allow login
      nextStep();
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <StepperFormBox
      title="Enter Your Credentials"
      description="Please provide your username and password to continue."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            id="username"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => handleInputChange(setUsername, e.target.value)}
            autoComplete="off"
            required
          />
        </div>
        <div className="space-y-2">
          <Input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => handleInputChange(setPassword, e.target.value)}
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
  );
}
