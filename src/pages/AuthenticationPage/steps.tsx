import { Step } from '@/components/SteppedPage';
import { DNASampleStep } from '@/pages/AuthenticationPage/steps/DNASampleStep/DNASampleStep.tsx';
import { PasswordStep } from './steps/PasswordStep';
import { BinaryQuestionStep } from './steps/BinaryQuestionStep';
import { ResetPasswordStep } from './steps/ResetPasswordState.tsx';
import {VoiceRecognition} from "@/pages/AuthenticationPage/steps/VoiceRecognition.tsx";

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
    id: 'password',
    content: <PasswordStep />,
  },
  {
    id: 'reset-password',
    content: <ResetPasswordStep />,
  },
  {
    id: 'voicerecognition',
    content: <VoiceRecognition />,
  },
  {
    id: 'dna-samples',
    content: <DNASampleStep />,
  },
  {
    id: 'binary',
    content: <BinaryQuestionStep />,
  },

];
