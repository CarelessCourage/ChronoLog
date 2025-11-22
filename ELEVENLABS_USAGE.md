# ElevenLabs Text-to-Speech Usage Guide

## Installation

First, install the ElevenLabs package:

```bash
bun add @elevenlabs/elevenlabs-js
```

## Setup

The ElevenLabs provider is already set up in `src/lib/elevenlabs.tsx` and wrapped around your app in `src/main.tsx`.

## Usage

### In any component:

```tsx
import { useElevenLabs, VOICES } from '@/lib/elevenlabs';

function MyComponent() {
  const { speak, stopSpeaking, isSpeaking } = useElevenLabs();

  const handleSpeak = () => {
    speak('Hello! This is text-to-speech.');
  };

  const handleSpeakCustomVoice = () => {
    // Use a specific voice ID
    speak('Using a custom voice!', VOICES.default);
  };

  return (
    <div>
      <button onClick={handleSpeak}>Speak</button>
      <button onClick={stopSpeaking}>Stop</button>
    </div>
  );
}
```

### Available Methods:

- **`speak(text: string, voiceId?: string)`** - Generate and play speech from text
- **`stopSpeaking()`** - Stop any currently playing speech
- **`isSpeaking`** - Boolean indicating if speech is currently playing

### Adding More Voices:

Edit `src/lib/elevenlabs.tsx` and add voice IDs to the `VOICES` object:

```tsx
const VOICES = {
  default: 'JBFqnCBsd6RMkjVDRZzb',
  narrator: 'another_voice_id',
  victor: 'yet_another_voice_id',
} as const;
```

### Example: Welcome Message

```tsx
import { useEffect } from 'react';
import { useElevenLabs } from '@/lib/elevenlabs';

function WelcomeScreen() {
  const { speak } = useElevenLabs();

  useEffect(() => {
    speak('Welcome to ChronoLog. Please authenticate to continue.');
  }, []);

  return <div>Welcome Screen</div>;
}
```

### Example: Trigger on Event

```tsx
import { useElevenLabs } from '@/lib/elevenlabs';

function GameStep() {
  const { speak } = useElevenLabs();

  const handleSuccess = () => {
    speak('Congratulations! You have passed the verification.');
  };

  const handleFailure = () => {
    speak('Nice try, but you need to do better than that.');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Success</button>
      <button onClick={handleFailure}>Failure</button>
    </div>
  );
}
```

## API Key Security

**Important**: The API key is currently hardcoded in the provider. For production, you should:

1. Move the API key to an environment variable:

   ```env
   VITE_ELEVENLABS_API_KEY=sk_your_key_here
   ```

2. Update `src/lib/elevenlabs.tsx`:
   ```tsx
   const elevenlabs = new ElevenLabsClient({
     apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY,
   });
   ```

## Voice IDs

You can find voice IDs in your ElevenLabs dashboard at https://elevenlabs.io/app/voice-library

The current default voice ID is: `JBFqnCBsd6RMkjVDRZzb`
