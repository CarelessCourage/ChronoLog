import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { createContext, useContext, useCallback, useRef, ReactNode } from 'react';

// Initialize ElevenLabs client
const elevenlabs = new ElevenLabsClient({
  apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY,
});

// Voice IDs - you can customize these
const VOICES = {
  default: 'NOpBlnGInO9m6vDvFkFC', // Custom voice
  // Add more voices as needed
  // narrator: 'another_voice_id',
  // victor: 'another_voice_id',
} as const;

interface ElevenLabsContextType {
  speak: (text: string, voiceId?: string) => Promise<void>;
  stopSpeaking: () => void;
  isSpeaking: boolean;
}

const ElevenLabsContext = createContext<ElevenLabsContextType | null>(null);

export function ElevenLabsProvider({ children }: { children: ReactNode }) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const isSpeakingRef = useRef(false);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  };

  const stopSpeaking = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {
        // Already stopped
      }
      sourceNodeRef.current = null;
      isSpeakingRef.current = false;
    }
  }, []);

  const speak = useCallback(
    async (text: string, voiceId: string = VOICES.default) => {
      try {
        // Stop any currently playing audio
        stopSpeaking();

        isSpeakingRef.current = true;

        const audioContext = getAudioContext();

        // Resume audio context if suspended (required for autoplay policy)
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        // Generate audio stream from ElevenLabs
        const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
          text,
          modelId: 'eleven_multilingual_v2',
          outputFormat: 'mp3_44100_128',
        });

        // Read the stream into chunks
        const reader = audioStream.getReader();
        const chunks: Uint8Array[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }

        // Create a blob from chunks
        const blob = new Blob(chunks as BlobPart[], { type: 'audio/mpeg' });
        const arrayBuffer = await blob.arrayBuffer();

        // Decode audio data
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Create and configure source node
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);

        sourceNodeRef.current = source;

        // Handle playback end
        source.onended = () => {
          isSpeakingRef.current = false;
          sourceNodeRef.current = null;
        };

        // Start playback
        source.start(0);
      } catch (error) {
        console.error('Error generating speech:', error);
        isSpeakingRef.current = false;
        sourceNodeRef.current = null;
      }
    },
    [stopSpeaking]
  );

  return (
    <ElevenLabsContext.Provider
      value={{
        speak,
        stopSpeaking,
        isSpeaking: isSpeakingRef.current,
      }}
    >
      {children}
    </ElevenLabsContext.Provider>
  );
}

export function useElevenLabs() {
  const context = useContext(ElevenLabsContext);
  if (!context) {
    throw new Error('useElevenLabs must be used within an ElevenLabsProvider');
  }
  return context;
}

// Export voices for easy access
export { VOICES };
