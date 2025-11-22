import { useStepper } from '@/components/StepperProvider';
import { StepperFormBox } from '@/components/StepperFormBox.tsx';
import { Input } from '@/components/ui/input';
import { RetroButton } from '@/components/ui/retro-button';
import { useState } from 'react';
import { credentials } from '@/lib/credentials';

/**
 * Validates if password is all uppercase
 */
const isAllUppercase = (password: string): boolean => {
  return password === password.toUpperCase() && password !== password.toLowerCase();
};

/**
 * Validates if password is all lowercase
 */
const isAllLowercase = (password: string): boolean => {
  return password === password.toLowerCase() && password !== password.toUpperCase();
};

/**
 * Validates if password has alternating upper and lowercase characters
 */
const isAlternatingCase = (password: string): boolean => {
  let shouldBeUpper = false;

  for (let i = 0; i < password.length; i++) {
    const char = password[i];

    // Skip non-alphabetic characters
    if (!/[a-zA-Z]/.test(char)) {
      continue;
    }

    if (shouldBeUpper) {
      if (char !== char.toUpperCase()) return false;
    } else {
      if (char !== char.toLowerCase()) return false;
    }

    shouldBeUpper = !shouldBeUpper;
  }

  return true;
};

export function ResetPasswordStep() {
  const { nextStep } = useStepper();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const resetAttempts = credentials.getResetAttempts();

  // Determine which requirement to show based on attempts
  const getRequirement = () => {
    switch (resetAttempts) {
      case 0:
        return 'Password must be all uppercase';
      case 1:
        return 'Policy changed, must be ALL LOWERCASE';
      case 2:
        return 'To the MAS2 directive passoword implemented. All passwords must alternate between LOWER and upper case) ';
      default:
        return 'Invalid password';
    }
  };

  const validatePassword = (password: string): boolean => {
    switch (resetAttempts) {
      case 0:
        return isAllUppercase(password);
      case 1:
        return isAllLowercase(password);
      case 2:
        return isAlternatingCase(password);
      default:
        return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Check password length
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    // Check if password contains at least one number
    if (!/\d/.test(newPassword)) {
      setError('Password must contain at least one number');
      return;
    }

    // Check if password was used before
    if (credentials.isPasswordInHistory(newPassword)) {
      setError('Password has been used before. Please choose a different password.');
      return;
    }

    // Validate based on current attempt
    if (!validatePassword(newPassword)) {
      setError(`Invalid password format. ${getRequirement()}`);
      return;
    }

    // All validations passed - but reject first 2 attempts
    if (resetAttempts < 2) {
      credentials.incrementResetAttempts();
      setError(`❌ Password reset failed.`);
      setNewPassword('');
      setConfirmPassword('');
      return;
    }

    // Third attempt with correct format - accept it
    // Generate a new identity (email changes too)
    const newEmail = `worker${Math.floor(Math.random() * 9000) + 1000}@chronolog.corp`;
    credentials.setIdentity(newEmail, newPassword);
    credentials.resetResetAttempts();
    nextStep();
  };

  return (
    <StepperFormBox title="Reset Your Password" description={getRequirement()}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            id="new-password"
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        <div className="space-y-2">
          <Input
            id="confirm-password"
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        {error && <div className="text-sm text-red-600 font-medium">{error}</div>}

        <RetroButton type="submit" className="w-full">
          Reset Password
        </RetroButton>
      </form>
    </StepperFormBox>
  );
}
