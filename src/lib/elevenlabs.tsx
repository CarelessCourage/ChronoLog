import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { createContext, useContext, useCallback, useRef, ReactNode, useState } from 'react';

// Initialize ElevenLabs client
const elevenlabs = new ElevenLabsClient({
  apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY,
});

// Track which texts have been preloaded this session (across all calls)
const globalPreloadedTexts = new Set<string>();

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
  preloadVoicesPriority: (
    items: { text: string; priority: number }[],
    options?: { parallelCount?: number; onFirstBatchReady?: () => void; voiceId?: string }
  ) => Promise<void>;
  playPreloaded: (text: string) => void;
}

const ElevenLabsContext = createContext<ElevenLabsContextType | null>(null);

export function ElevenLabsProvider({ children }: { children: ReactNode }) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const preloadedAudioRef = useRef<Map<string, AudioBuffer>>(new Map());
  const currentlyPlayingRef = useRef<string | null>(null);

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
        sourceNodeRef.current = null;
      } catch {
        // Already stopped
      }
      setIsSpeaking(false);
      setIsLoading(false);
      currentlyPlayingRef.current = null;
    }
  }, []);

  const preloadVoices = useCallback(async (texts: string[], voiceId: string = VOICES.default) => {
    setIsLoading(true);

    try {
      // Filter out already preloaded texts (both local and global)
      const textsToLoad = texts.filter(
        (text) => !preloadedAudioRef.current.has(text) && !globalPreloadedTexts.has(text)
      );

      if (textsToLoad.length === 0) {
        setIsLoading(false);
        return;
      }

      // Preload all voices in parallel
      await Promise.all(
        textsToLoad.map(async (text) => {
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

            // Store the raw array buffer for later decode
            preloadedAudioRef.current.set(text, arrayBuffer as any);
            globalPreloadedTexts.add(text);
          } catch (error) {
            console.error(`Error preloading voice for text: "${text}"`, error);
          }
        })
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const playPreloaded = useCallback(
    async (text: string) => {
      try {
        // Prevent multiple simultaneous playbacks
        if (currentlyPlayingRef.current === text) {
          return;
        }

        // Stop any currently playing audio
        stopSpeaking();

        const audioData = preloadedAudioRef.current.get(text);
        if (!audioData) {
          console.error('Audio not preloaded for text:', text);
          return;
        }

        currentlyPlayingRef.current = text;

        // Create AudioContext on first play (after user gesture)
        const audioContext = getAudioContext();

        // Resume audio context if suspended (required for autoplay policy)
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        // Decode audio data if needed (stored as ArrayBuffer)
        let audioBuffer: AudioBuffer;
        if (audioData instanceof ArrayBuffer) {
          audioBuffer = await audioContext.decodeAudioData(audioData.slice(0));
          // Cache the decoded buffer
          preloadedAudioRef.current.set(text, audioBuffer);
        } else {
          audioBuffer = audioData;
        }

        setIsSpeaking(true);

        // Create and configure source node with gain
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;

        // Add gain node to increase volume
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 2.0; // Increase voice volume

        source.connect(gainNode);
        gainNode.connect(audioContext.destination);

        sourceNodeRef.current = source;

        // Handle playback end
        source.onended = () => {
          setIsSpeaking(false);
          sourceNodeRef.current = null;
          currentlyPlayingRef.current = null;
        };

        // Start playback
        source.start(0);
      } catch (error) {
        console.error('Error playing preloaded audio:', error);
        setIsSpeaking(false);
        sourceNodeRef.current = null;
        currentlyPlayingRef.current = null;
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

        // Create and configure source node with gain
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;

        // Add gain node to increase volume
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 2.0; // Increase voice volume

        source.connect(gainNode);
        gainNode.connect(audioContext.destination);

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

  // Priority-based, sequential preloading
  const preloadVoicesPriority = useCallback(
    async (
      items: { text: string; priority: number }[],
      options?: { parallelCount?: number; onFirstBatchReady?: () => void; voiceId?: string }
    ) => {
      const { parallelCount = 3, onFirstBatchReady, voiceId = VOICES.default } = options || {};
      setIsLoading(true);

      // Sort by priority ascending (lower = higher priority)
      const sorted = [...items].sort((a, b) => a.priority - b.priority);
      const textsToLoad = sorted.filter(
        (item) => !preloadedAudioRef.current.has(item.text) && !globalPreloadedTexts.has(item.text)
      );
      if (textsToLoad.length === 0) {
        setIsLoading(false);
        if (onFirstBatchReady) onFirstBatchReady();
        return;
      }

      // Preload first N in parallel
      const firstBatch = textsToLoad.slice(0, parallelCount);
      const rest = textsToLoad.slice(parallelCount);

      await Promise.all(
        firstBatch.map(async (item) => {
          try {
            const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
              text: item.text,
              modelId: 'eleven_multilingual_v2',
              outputFormat: 'mp3_44100_128',
            });
            const reader = audioStream.getReader();
            const chunks: Uint8Array[] = [];
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              chunks.push(value);
            }
            const blob = new Blob(chunks as BlobPart[], { type: 'audio/mpeg' });
            const arrayBuffer = await blob.arrayBuffer();
            preloadedAudioRef.current.set(item.text, arrayBuffer as any);
            globalPreloadedTexts.add(item.text);
          } catch (error) {
            console.error(`Error preloading voice for text: "${item.text}"`, error);
          }
        })
      );
      if (onFirstBatchReady) onFirstBatchReady();

      // Preload the rest sequentially (one at a time)
      for (const item of rest) {
        try {
          const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
            text: item.text,
            modelId: 'eleven_multilingual_v2',
            outputFormat: 'mp3_44100_128',
          });
          const reader = audioStream.getReader();
          const chunks: Uint8Array[] = [];
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
          }
          const blob = new Blob(chunks as BlobPart[], { type: 'audio/mpeg' });
          const arrayBuffer = await blob.arrayBuffer();
          preloadedAudioRef.current.set(item.text, arrayBuffer as any);
          globalPreloadedTexts.add(item.text);
        } catch (error) {
          console.error(`Error preloading voice for text: "${item.text}"`, error);
        }
      }
      setIsLoading(false);
    },
    []
  );

  return (
    <ElevenLabsContext.Provider
      value={{
        speak,
        stopSpeaking,
        isSpeaking,
        isLoading,
        preloadVoices,
        preloadVoicesPriority,
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
