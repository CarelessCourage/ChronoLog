import { useStepper } from '@/components/StepperProvider';
import {StepperFormBox} from "@/components/StepperFormBox.tsx";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
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
  '⚠️ Your session will expire soon!',
  '🔔 New notification: Please verify your identity',
  '⏰ Reminder: Update your security settings',
  '📧 You have unread messages',
  '🔒 Security alert: Unusual login attempt detected',
  '💬 System message: Please complete verification',
  '⚡ Action required: Confirm your email address',
  '🎯 Important: Review your account settings',
];

export function PasswordStep() {
  const { nextStep } = useStepper();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  // Random interruption feature
  useEffect(() => {
    const scheduleRandomInterruption = () => {
      // Random interval between 5-10 seconds
      const randomDelay = Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;
      
      const timeoutId = setTimeout(() => {
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
        
        // Schedule next interruption
        scheduleRandomInterruption();
      }, randomDelay);
      
      return timeoutId;
    };
    
    const timeoutId = scheduleRandomInterruption();
    
    // Cleanup on unmount
    return () => clearTimeout(timeoutId);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      nextStep();
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <StepperFormBox>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="email"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="off"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        {error && (
          <div className="text-sm text-red-600 font-medium">{error}</div>
        )}
        <Button type="submit" className="w-full">
          Login
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

