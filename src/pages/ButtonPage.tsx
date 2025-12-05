import { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { RetroButton } from '@/components/ui/retro-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function ButtonPage() {
  const [sessionId, setSessionId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [hasPressed, setHasPressed] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogTitle, setDialogTitle] = useState('');

  const pressButton = useMutation(api.buttonSync.pressButton);
  const session = useQuery(
    api.buttonSync.getSession,
    isConnected && sessionId ? { sessionId: sessionId.toUpperCase() } : 'skip'
  );

  useEffect(() => {
    if (!session) return;

    // Handle session status changes
    if (session.status === 'success') {
      setDialogTitle('✅ Success!');
      setDialogMessage('Authentication successful! Both buttons were pressed simultaneously.');
      setIsDialogOpen(true);
    } else if (session.status === 'failed_not_simultaneous') {
      setDialogTitle('❌ Failed');
      setDialogMessage(
        'The buttons were not pressed at the same time. Wait for the other person to create a new session, then try again.'
      );
      setIsDialogOpen(true);
      setHasPressed(false);
    } else if (session.status === 'failed_timeout') {
      setDialogTitle('⏰ Session Expired');
      setDialogMessage(
        'This session has expired. Wait for the other person to create a new session.'
      );
      setIsDialogOpen(true);
      setHasPressed(false);
    }
  }, [session]);

  const handleConnect = () => {
    if (sessionId.trim().length !== 6) {
      setDialogTitle('Invalid Code');
      setDialogMessage('Please enter a valid 6-character session ID.');
      setIsDialogOpen(true);
      return;
    }
    setIsConnected(true);
  };

  const handlePress = async () => {
    if (!sessionId || hasPressed) return;

    try {
      setHasPressed(true);
      await pressButton({ sessionId: sessionId.toUpperCase(), role: 'helper' });
    } catch (error) {
      setDialogTitle('Error');
      setDialogMessage(error instanceof Error ? error.message : 'An error occurred');
      setIsDialogOpen(true);
      setHasPressed(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold font-pixel">Button Helper</h1>
          <p className="text-sm text-gray-600">
            Help someone authenticate by pressing the button at the same time
          </p>
        </div>

        {!isConnected ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sessionId">Enter Session ID</Label>
              <Input
                id="sessionId"
                type="text"
                placeholder="XXXXXX"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center text-2xl font-mono tracking-widest"
              />
              <p className="text-xs text-gray-500">Ask the person for their 6-character ID code</p>
            </div>

            <RetroButton
              onClick={handleConnect}
              className="w-full"
              disabled={sessionId.length !== 6}
            >
              Connect
            </RetroButton>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border-2 border-blue-400 p-4 rounded text-center">
              <p className="text-sm font-semibold mb-2">Connected to session:</p>
              <p className="text-2xl font-bold font-mono tracking-wider">{sessionId}</p>
            </div>

            <RetroButton
              onClick={handlePress}
              disabled={hasPressed}
              className="w-full h-16 text-lg font-bold bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-400"
              variant={hasPressed ? 'secondary' : 'default'}
            >
              {hasPressed ? 'Button Pressed!' : 'PRESS BUTTON'}
            </RetroButton>

            {session?.userPressed && !session?.helperPressed && (
              <p className="text-sm text-center text-green-600 font-semibold animate-pulse">
                Other person is ready! Press now!
              </p>
            )}

            {session?.helperPressed && !session?.userPressed && (
              <p className="text-sm text-center text-blue-600 font-semibold">
                Waiting for other person to press...
              </p>
            )}

            <RetroButton
              onClick={() => {
                setIsConnected(false);
                setHasPressed(false);
                setSessionId('');
              }}
              variant="outline"
              className="w-full"
            >
              Disconnect
            </RetroButton>
          </div>
        )}
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
    </div>
  );
}
