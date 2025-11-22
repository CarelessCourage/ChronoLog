import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { createContext, useContext, useCallback, useRef, ReactNode, useState } from 'react';

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
  isLoading: boolean;
  preloadVoices: (texts: string[], voiceId?: string) => Promise<void>;
  playPreloaded: (text: string) => void;
}

const ElevenLabsContext = createContext<ElevenLabsContextType | null>(null);

export function ElevenLabsProvider({ children }: { children: ReactNode }) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const preloadedAudioRef = useRef<Map<string, AudioBuffer>>(new Map());

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
      setIsSpeaking(false);
      setIsLoading(false);
    }
  }, []);

  const preloadVoices = useCallback(
    async (texts: string[], voiceId: string = VOICES.default) => {
      setIsLoading(true);
      const audioContext = getAudioContext();

      try {
        // Preload all voices in parallel
        await Promise.all(
          texts.map(async (text) => {
            // Skip if already preloaded
            if (preloadedAudioRef.current.has(text)) {
              return;
            }

            try {
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

              // Store preloaded audio
              preloadedAudioRef.current.set(text, audioBuffer);
            } catch (error) {
              console.error(`Error preloading voice for text: "${text}"`, error);
            }
          })
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const playPreloaded = useCallback(
    (text: string) => {
      try {
        // Stop any currently playing audio
        stopSpeaking();

        const audioBuffer = preloadedAudioRef.current.get(text);
        if (!audioBuffer) {
          console.error('Audio not preloaded for text:', text);
          return;
        }

        const audioContext = getAudioContext();

        // Resume audio context if suspended (required for autoplay policy)
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }

        setIsSpeaking(true);

        // Create and configure source node
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);

        sourceNodeRef.current = source;

        // Handle playback end
        source.onended = () => {
          setIsSpeaking(false);
          sourceNodeRef.current = null;
        };

        // Start playback
        source.start(0);
      } catch (error) {
        console.error('Error playing preloaded audio:', error);
        setIsSpeaking(false);
        sourceNodeRef.current = null;
      }
    },
    [stopSpeaking]
  );

  const speak = useCallback(
    async (text: string, voiceId: string = VOICES.default) => {
      try {
        // Stop any currently playing audio
        stopSpeaking();

        setIsLoading(true);

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

        setIsLoading(false);
        setIsSpeaking(true);

        // Create and configure source node
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);

        sourceNodeRef.current = source;

        // Handle playback end
        source.onended = () => {
          setIsSpeaking(false);
          sourceNodeRef.current = null;
        };

        // Start playback
        source.start(0);
      } catch (error) {
        console.error('Error generating speech:', error);
        setIsSpeaking(false);
        setIsLoading(false);
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
        isSpeaking,
        isLoading,
        preloadVoices,
        playPreloaded,
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
