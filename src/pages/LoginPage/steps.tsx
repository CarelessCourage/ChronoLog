import { Step } from '@/components/SteppedPage';
import { EmailStep } from './steps/EmailStep';
import { PasswordStep } from './steps/PasswordStep';
import { VerificationStep } from './steps/VerificationStep';

/**
 * Configure your login steps here.
 * 
 * To add a new step:
 * 1. Create a new component in the steps/ folder
 * 2. Import it and add it to this array
 * 
 * To reorder steps:
 * Simply change the order in this array
 * 
 * To remove a step:
 * Remove it from this array
 */
export const loginSteps: Step[] = [
  {
    id: 'email',
    title: 'Welcome Back',
    description: 'Enter your email to continue',
    content: <EmailStep />,
  },
  {
    id: 'password',
    title: 'Enter Password',
    description: 'Please enter your password',
    content: <PasswordStep />,
  },
  {
    id: 'verification',
    title: 'Two-Factor Authentication',
    description: 'Verify your identity',
    content: <VerificationStep />,
  },
];

