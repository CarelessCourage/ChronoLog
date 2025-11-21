# LoginPage - Multi-Step Stepper Example

This is an example of how to use the `SteppedPage` component and `StepperProvider` to create a multi-step flow.

## Architecture

### Components

- **StepperProvider** (`/src/components/StepperProvider.tsx`) - Context provider that manages step state
- **useStepper** hook - Access stepper state and controls from any child component
- **SteppedPage** (`/src/components/SteppedPage.tsx`) - Generic page wrapper for multi-step flows

### How It Works

1. **Define your steps** in `steps.tsx`:
```typescript
export const loginSteps: Step[] = [
  {
    id: 'email',
    title: 'Welcome Back',
    description: 'Enter your email to continue',
    content: <EmailStep />,
  },
  // ... more steps
];
```

2. **Create step components** that use the `useStepper` hook:
```typescript
import { useStepper } from '@/components/StepperProvider';

export function EmailStep() {
  const { nextStep, previousStep, isFirstStep, isLastStep } = useStepper();
  
  // Your component logic
}
```

3. **Use SteppedPage** in your page:
```typescript
<SteppedPage 
  title="ChronoLog"
  subtitle="Time Compliance Portal"
  steps={loginSteps}
  onComplete={handleComplete}
/>
```

## Available Hook Methods

The `useStepper` hook provides:

- `currentStep: number` - Current step index (0-based)
- `totalSteps: number` - Total number of steps
- `nextStep()` - Go to next step (or call onComplete on last step)
- `previousStep()` - Go to previous step
- `goToStep(n)` - Jump to specific step
- `isFirstStep: boolean` - True if on first step
- `isLastStep: boolean` - True if on last step
- `progress: number` - Progress percentage (0-100)

## Adding a New Step

1. Create a new component in `steps/` folder:

```typescript
// steps/NewStep.tsx
import { useStepper } from '@/components/StepperProvider';

export function NewStep() {
  const { nextStep, previousStep } = useStepper();
  
  return (
    <div>
      {/* Your content */}
      <button onClick={nextStep}>Continue</button>
    </div>
  );
}
```

2. Add it to `steps.tsx`:

```typescript
import { NewStep } from './steps/NewStep';

export const loginSteps: Step[] = [
  // ... existing steps
  {
    id: 'new-step',
    title: 'New Step',
    description: 'Step description',
    content: <NewStep />,
  },
];
```

## Reordering Steps

Simply reorder the array in `steps.tsx`:

```typescript
export const loginSteps: Step[] = [
  passwordStep,  // Moved to first
  emailStep,     // Moved to second
  verificationStep,
];
```

## Using in Other Pages

You can create other multi-step pages by following the same pattern:

```typescript
// ExamplePage.tsx
import { SteppedPage, Step } from '@/components/SteppedPage';

const mySteps: Step[] = [
  { id: '1', title: 'Step 1', description: 'First', content: <MyStep1 /> },
  { id: '2', title: 'Step 2', description: 'Second', content: <MyStep2 /> },
];

export function ExamplePage() {
  return <SteppedPage steps={mySteps} onComplete={() => console.log('Done!')} />;
}
```

