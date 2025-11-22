import { useStepper } from '@/components/StepperProvider';
import { StepperFormBox } from '@/components/StepperFormBox.tsx';
import { RetroButton } from '@/components/ui/retro-button';
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { sendVictorToast } from '@/lib/victor';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function ButtonSyncStep() {
  const { nextStep } = useStepper();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hasPressed, setHasPressed] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogTitle, setDialogTitle] = useState('');
  const [failureCount, setFailureCount] = useState(0);

  const createSession = useMutation(api.buttonSync.createSession);
  const pressButton = useMutation(api.buttonSync.pressButton);
  const resetSession = useMutation(api.buttonSync.resetSession);
  const session = useQuery(api.buttonSync.getSession, sessionId ? { sessionId } : 'skip');

  useEffect(() => {
    // Create session on mount
    createSession({}).then((result) => {
      setSessionId(result.sessionId);
    });
  }, [createSession]);

  useEffect(() => {
    if (!session) return;

    // Handle session status changes
    if (session.status === 'success') {
      setDialogTitle('✅ Success!');
      setDialogMessage('Both buttons pressed simultaneously. Authentication successful!');
      setIsDialogOpen(true);
      setTimeout(() => {
        nextStep();
      }, 2000);
    } else if (session.status === 'failed_not_simultaneous') {
      const newFailureCount = failureCount + 1;
      setFailureCount(newFailureCount);

      if (newFailureCount >= 2) {
        sendVictorToast(
          'SERIOUSLY?! Two failed attempts at pressing a button simultaneously? ' +
            'This is literally the simplest task. Are you even trying? ' +
            'Get your friend on the phone and COUNT TO THREE.'
        );
      }

      setDialogTitle('❌ Failed');
      setDialogMessage(
        `The buttons were not pressed at the same time (Attempt ${newFailureCount}). ` +
          'You need to press within 1 second of each other. Keep your ID code and try again!'
      );
      setIsDialogOpen(true);
      setHasPressed(false);
      // Reset the session state but keep the same ID
      if (sessionId) {
        resetSession({ sessionId });
      }
    } else if (session.status === 'failed_timeout') {
      setDialogTitle('⏰ Session Expired');
      setDialogMessage('Your session has expired. A new session has been created.');
      setIsDialogOpen(true);
      setHasPressed(false);
      // Create a new session
      createSession({}).then((result) => {
        setSessionId(result.sessionId);
      });
    }
  }, [session, nextStep, createSession]);

  const handlePress = async () => {
    if (!sessionId || hasPressed) return;

    try {
      setHasPressed(true);
      await pressButton({ sessionId, role: 'user' });
    } catch (error) {
      setDialogTitle('Error');
      setDialogMessage(error instanceof Error ? error.message : 'An error occurred');
      setIsDialogOpen(true);
      setHasPressed(false);
    }
  };

  return (
    <StepperFormBox
      title="Two-Person Verification"
      description="To uphold organizational security protocols and identity verification standards, managerial intervention is required to authenticate your credentials as part of the mandated safeguard process."
    >
      <div className="space-y-6">
        <div className="bg-yellow-50 border-2 border-yellow-400 p-4 rounded space-y-3">
          <p className="text-sm font-semibold">Instructions:</p>
          <ol className="text-sm space-y-2 list-decimal list-inside">
            <li>Per organizational compliance protocols, your managerial authority is requested to initiate application access on an alternate, approved device to maintain cross-platform operational integrity.</li>
            <li>
              Tell them to go to{' '}
              <span className="font-mono bg-white px-2 py-1 rounded">/button</span>
            </li>
            <li>
              Give them your ID code (NB: NOT by Slack, email or phone. Do NOT write it down):
              <div className="mt-2 bg-white p-3 rounded text-center">
                <span className="text-2xl font-bold font-mono tracking-wider">
                  {sessionId || '------'}
                </span>
              </div>
            </li>
            <li>When they enter your code, both press the button at the SAME TIME</li>
          </ol>
        </div>

        <div className="space-y-3">
          <RetroButton
            onClick={handlePress}
            disabled={!sessionId || hasPressed}
            size="lg"
            className="w-full h-16 bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-400"
            variant={hasPressed ? 'secondary' : 'default'}
          >
            {hasPressed ? '⏳ Waiting for helper...' : 'PRESS BUTTON'}
          </RetroButton>

          {session?.helperPressed && !session?.userPressed && (
            <p className="text-sm text-center text-green-600 font-semibold animate-pulse">
              Helper is ready! Press now!
            </p>
          )}

          {session?.userPressed && !session?.helperPressed && (
            <p className="text-sm text-center text-blue-600 font-semibold">
              Waiting for helper to press...
            </p>
          )}
        </div>

        <div className="text-xs text-gray-500 text-center">Session expires in 5 minutes</div>
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
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
