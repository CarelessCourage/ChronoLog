import { useStepper } from '@/components/StepperProvider';
import { StepperFormBox } from '@/components/StepperFormBox';
import { Button } from '@/components/ui/button';
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
    <StepperFormBox>
      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 tracking-wider font-pixel">
            SECURITY VERIFICATION
          </h2>
          <div className="font-normal">
            <p className="text-sm text-gray-600 mb-6">Please answer the following question:</p>
            <div className="p-4 bg-gray-100 win98-inset mb-6">
              <p className="text-center font-mono text-sm text-gray-900 break-all leading-relaxed">
                {binaryQuestion}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            onClick={() => handleAnswer('yes')}
            className="win98-outset bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold tracking-wider px-8 font-pixel"
          >
            <span className="font-mono">{binaryYes}</span>
          </Button>
          <Button
            onClick={() => handleAnswer('no')}
            className="win98-outset bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold tracking-wider px-8 font-pixel"
          >
            <span className="font-mono">{binaryNo}</span>
          </Button>

          <Button
            onClick={() => handleAnswer('maybe')}
            className="win98-outset bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold tracking-wider px-8 font-pixel"
          >
            <span className="font-mono">{binaryMaybe}</span>
          </Button>
        </div>
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>System Notification</AlertDialogTitle>
            <AlertDialogDescription>{dialogMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsDialogOpen(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </StepperFormBox>
  );
}
