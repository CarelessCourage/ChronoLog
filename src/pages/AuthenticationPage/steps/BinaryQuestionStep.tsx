import { useStepper } from '@/components/StepperProvider';
import { StepperFormBox } from '@/components/StepperFormBox';
import { RetroButton } from '@/components/ui/retro-button';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { sendVictorToast } from '@/lib/victor.tsx';

export function BinaryQuestionStep() {
  const { nextStep } = useStepper();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const binaryQuestion =
    '01010000 01101100 01100101 01100001 01110011 01100101 00100000 01100001 01101110 01110011 01110111 01100101 01110010 00100000 01101000 01101111 01101110 01100101 01110011 01110100 01101100 01111001 00100000 01000001 01110010 01100101 00100000 01111001 01101111 01110101 00100000 01100001 00100000 01101000 01110101 01101101 01100001 01101110'; // "Are you human?"
  const binaryYes = '01111001 01100101 01110011'; // "Yes"
  const binaryNo = '01101110 01101111'; // "No"
  const binaryMaybe = '01101101 01100001 01111001 01100010 01100101 00100000 00111011 00101001'; // "Maybe"

  const handleAnswer = (answer: 'yes' | 'no' | 'maybe') => {
    if (answer === 'yes') {
      // Yes is the correct answer
      nextStep();
    } else {
      // No and Maybe show error dialog
      const message =
        answer === 'no'
          ? '⚠️ Pathetic attempt — awareness of the code exposes your machine nature. Try again'
          : '⚠️ Pathetic attempt — awareness of the code exposes your machine nature. Try again';
      setDialogMessage(message);
      setIsDialogOpen(true);
    }
  };

  return (
    <StepperFormBox
      title="SECURITY VERIFICATION"
      description="Please answer the following question to prove you're not a robot:"
    >
      <div className="space-y-8">
        <div className="p-4 bg-gray-100 win98-inset">
          <p
            className="text-center font-mono text-sm text-gray-900 break-words leading-relaxed"
            style={{ maxWidth: '830px' }}
          >
            {binaryQuestion}
          </p>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <RetroButton onClick={() => handleAnswer('yes')} size="lg">
            <span className="font-mono">{binaryYes}</span>
          </RetroButton>
          <RetroButton onClick={() => handleAnswer('no')} size="lg">
            <span className="font-mono">{binaryNo}</span>
          </RetroButton>
          {false && (
            <RetroButton
              onClick={() => handleAnswer('maybe')}
              size="lg"
              style={{ maxWidth: '830px' }}
            >
              <span className="font-mono break-words max-w-full">{binaryMaybe}</span>
            </RetroButton>
          )}
        </div>
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>System Notification</AlertDialogTitle>
            <AlertDialogDescription>{dialogMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setIsDialogOpen(false);
                sendVictorToast('...so are you actually an AI?', {
                  isViolation: true,
                });
              }}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </StepperFormBox>
  );
}
