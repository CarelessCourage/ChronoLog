import { Step } from '@/components/SteppedPage';
import { IdentifyStep } from './steps/IdentifyStep.tsx';
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
    id: 'password',
    content: <PasswordStep />,
  },
  {
    id: 'identify',
    content: <IdentifyStep />,
  },
  {
    id: 'captcha',
    content: <CaptchaStep />,
  },
];

