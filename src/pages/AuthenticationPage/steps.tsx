import { Step } from '@/components/SteppedPage';
import { DNASampleStep } from '@/pages/AuthenticationPage/steps/DNASampleStep/DNASampleStep.tsx';
import { PasswordStep } from './steps/PasswordStep';
import { CaptchaStep } from './steps/CaptchaStep.tsx';
import { BinaryQuestionStep } from './steps/BinaryQuestionStep';

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
    id: 'binary',
    content: <BinaryQuestionStep />,
  },
  {
    id: 'identify',
    content: <DNASampleStep />,
  },
  {
    id: 'password',
    content: <PasswordStep />,
  },
  {
    id: 'captcha',
    content: <CaptchaStep />,
  },
];

