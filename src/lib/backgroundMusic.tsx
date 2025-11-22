import { createContext, useContext, useRef, ReactNode, useCallback } from 'react';

interface BackgroundMusicContextType {
  startMusic: () => void;
  stopMusic: () => void;
  startAmbient: () => void;
  stopAmbient: () => void;
  isPlaying: boolean;
}

const BackgroundMusicContext = createContext<BackgroundMusicContextType | null>(null);

export function BackgroundMusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ambientRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);

  const startMusic = useCallback(() => {
    if (isPlayingRef.current) return; // Already playing

    if (!audioRef.current) {
      audioRef.current = new Audio('/audio/miamiBluesDetective.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.7;
    }

    audioRef.current.play().catch((e) => {
      console.log('Background music autoplay blocked:', e);
    });

    isPlayingRef.current = true;
  }, []);

  const stopMusic = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      isPlayingRef.current = false;
    }
  }, []);

  const startAmbient = useCallback(() => {
    if (!ambientRef.current) {
      ambientRef.current = new Audio('/audio/stormyNight.mp3');
      ambientRef.current.loop = true;
      ambientRef.current.volume = 1;
    }

    ambientRef.current.play().catch((e) => {
      console.log('Ambient sound autoplay blocked:', e);
    });
  }, []);

  const stopAmbient = useCallback(() => {
    if (ambientRef.current) {
      ambientRef.current.pause();
    }
  }, []);

  return (
    <BackgroundMusicContext.Provider
      value={{
        startMusic,
        stopMusic,
        startAmbient,
        stopAmbient,
        isPlaying: isPlayingRef.current,
      }}
    >
      {children}
    </BackgroundMusicContext.Provider>
  );
}

export function useBackgroundMusic() {
  const context = useContext(BackgroundMusicContext);
  if (!context) {
    throw new Error('useBackgroundMusic must be used within a BackgroundMusicProvider');
  }
  return context;
}
