# Stepper System - Quick Start Guide

This project includes a reusable stepper system for creating multi-step flows with ease.

## Architecture Overview

```
┌─────────────────────────────────────┐
│     StepperProvider (Context)       │
│  - Manages current step state       │
│  - Provides navigation methods      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      useStepper() Hook              │
│  - Access step state & controls     │
│  - Used by step components          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      SteppedPage Component          │
│  - Generic page wrapper             │
│  - Takes array of steps             │
│  - Handles UI & progress            │
└─────────────────────────────────────┘
```

## Core Files

- **`/src/components/StepperProvider.tsx`** - Context provider and hook
- **`/src/components/SteppedPage.tsx`** - Generic stepped page component
- **`/src/pages/LoginPage/`** - Example implementation

## Example: LoginPage

The LoginPage demonstrates the pattern:

### 1. Define Steps (`steps.tsx`)

```tsx
import { Step } from '@/components/SteppedPage';
import { EmailStep } from './steps/EmailStep';
import { PasswordStep } from './steps/PasswordStep';

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
];
```

### 2. Create Step Components

Each step component uses the `useStepper` hook:

```tsx
import { useStepper } from '@/components/StepperProvider';

export function EmailStep() {
  const { nextStep, previousStep, isLastStep } = useStepper();
  
  return (
    <form onSubmit={() => nextStep()}>
      {/* Your form fields */}
      <button type="submit">Continue</button>
    </form>
  );
}
```

### 3. Use SteppedPage in Your Page

```tsx
import { SteppedPage } from '@/components/SteppedPage';
import { loginSteps } from './steps';

export function LoginPage() {
  const handleComplete = () => {
    console.log('All steps completed!');
  };

  return (
    <SteppedPage 
      title="ChronoLog"
      subtitle="Time Compliance Portal"
      steps={loginSteps}
      onComplete={handleComplete}
    />
  );
}
```

## useStepper Hook API

```typescript
const {
  currentStep,    // number - Current step index (0-based)
  totalSteps,     // number - Total number of steps
  nextStep,       // () => void - Go to next step
  previousStep,   // () => void - Go to previous step
  goToStep,       // (n: number) => void - Jump to specific step
  isFirstStep,    // boolean - True if on first step
  isLastStep,     // boolean - True if on last step
  progress,       // number - Progress percentage (0-100)
} = useStepper();
```

## Creating a New Stepped Page

### Option A: New Folder Structure (Recommended for complex flows)

```
src/pages/OnboardingPage/
├── index.tsx              # Main page component
├── steps.tsx              # Step configuration
└── steps/
    ├── ProfileStep.tsx
    ├── PreferencesStep.tsx
    └── ConfirmStep.tsx
```

### Option B: Single File (For simple flows)

```tsx
import { SteppedPage, Step } from '@/components/SteppedPage';
import { useStepper } from '@/components/StepperProvider';

function Step1() {
  const { nextStep } = useStepper();
  return <div><button onClick={nextStep}>Next</button></div>;
}

function Step2() {
  const { previousStep, nextStep } = useStepper();
  return <div>
    <button onClick={previousStep}>Back</button>
    <button onClick={nextStep}>Next</button>
  </div>;
}

const steps: Step[] = [
  { id: '1', title: 'First', description: 'Step 1', content: <Step1 /> },
  { id: '2', title: 'Second', description: 'Step 2', content: <Step2 /> },
];

export function MyPage() {
  return <SteppedPage steps={steps} onComplete={() => alert('Done!')} />;
}
```

## Common Patterns

### Conditional Navigation

```tsx
function MyStep() {
  const { nextStep } = useStepper();
  const [isValid, setIsValid] = useState(false);
  
  const handleNext = () => {
    if (isValid) {
      nextStep();
    }
  };
  
  return <button onClick={handleNext} disabled={!isValid}>Continue</button>;
}
```

### Skip a Step Programmatically

```tsx
function ConditionalStep() {
  const { nextStep, goToStep } = useStepper();
  
  const handleSkip = () => {
    goToStep(3); // Jump to step 3
  };
  
  return (
    <div>
      <button onClick={nextStep}>Continue</button>
      <button onClick={handleSkip}>Skip to end</button>
    </div>
  );
}
```

### Show Different Button on Last Step

```tsx
function MyStep() {
  const { nextStep, isLastStep } = useStepper();
  
  return (
    <button onClick={nextStep}>
      {isLastStep ? 'Finish' : 'Continue'}
    </button>
  );
}
```

## Benefits

✅ **Reusable** - One stepper implementation for all multi-step flows
✅ **Flexible** - Easy to add, remove, or reorder steps
✅ **Type-Safe** - Full TypeScript support
✅ **Decoupled** - Steps don't need to know about each other
✅ **Consistent** - Same UX across all stepped pages
✅ **Simple** - Minimal boilerplate, intuitive API

## Tips

- Keep step components focused on their specific task
- Use the `useStepper` hook for all navigation
- Store shared data in parent component or context if needed
- The `onComplete` callback fires when `nextStep()` is called on the last step
- Steps can be async - handle loading states within your step components

