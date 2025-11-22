import { createContext, useContext, useRef, ReactNode, useCallback } from 'react';

interface BackgroundMusicContextType {
  startMusic: () => void;
  stopMusic: () => void;
  startAmbient: () => void;
  stopAmbient: () => void;
  isPlaying: boolean;
  setMusicVolume: (volume: number) => void;
  setAmbientVolume: (volume: number) => void;
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
      audioRef.current.volume = 0.2; // Lower default music volume
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
      ambientRef.current.volume = 1; // Much higher rain volume (separate channel)
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

  const setMusicVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  const setAmbientVolume = useCallback((volume: number) => {
    if (ambientRef.current) {
      ambientRef.current.volume = Math.max(0, Math.min(1, volume));
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
        setMusicVolume,
        setAmbientVolume,
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
