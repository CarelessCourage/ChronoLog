import { useStepper } from '@/components/StepperProvider';
import {StepperFormBox} from "@/components/StepperFormBox.tsx";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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

// Hardcoded credentials
const VALID_USERNAME = 'worker2847@chronolog.corp';
const VALID_PASSWORD = 'Compliance2024!';

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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  
  // Character-based interruption tracking
  const charCountRef = useRef(0);
  const thresholdRef = useRef(Math.floor(Math.random() * 3) + 2); // Random threshold between 2-4
  
  // Track if this is the first successful login attempt
  const hasAttemptedCorrectLoginRef = useRef(false);

  const triggerInterruption = () => {
    // Blur the active element (remove focus from input)
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    
    // Show random alert message
    const randomMessage = INTERRUPTION_MESSAGES[
      Math.floor(Math.random() * INTERRUPTION_MESSAGES.length)
    ];
    setDialogMessage(randomMessage);
    setIsDialogOpen(true);
    
    // Reset counter and set new random threshold
    charCountRef.current = 0;
    thresholdRef.current = Math.floor(Math.random() * 5) + 2; // New threshold between 2-4
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

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      // If this is the first time they got it correct, force password reset
      if (!hasAttemptedCorrectLoginRef.current) {
        hasAttemptedCorrectLoginRef.current = true;
        setError('⚠️ Your password has expired. Please re-enter your credentials to reset.');
        setUsername('');
        setPassword('');
        return;
      }
      // Second time with correct credentials, allow login
      nextStep();
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <StepperFormBox>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
        
          <Input
            id="username"
            type="password"
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
        {error && (
          <div className="text-sm text-red-600 font-medium">{error}</div>
        )}
        <Button type="submit" className="w-full">
          OK
        </Button>
      </form>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>System Notification</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsDialogOpen(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </StepperFormBox>
  );
}

