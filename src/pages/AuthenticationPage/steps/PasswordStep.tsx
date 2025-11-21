import { useStepper } from '@/components/StepperProvider';
import {StepperFormBox} from "@/components/StepperFormBox.tsx";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

// Hardcoded credentials
const VALID_USERNAME = 'user@lol.com';
const VALID_PASSWORD = 'qwerty';

export function PasswordStep() {
  const { nextStep } = useStepper();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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
    </StepperFormBox>
  );
}

