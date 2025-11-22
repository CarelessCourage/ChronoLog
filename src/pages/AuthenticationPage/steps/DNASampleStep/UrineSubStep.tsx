import { FC, useState, useEffect, useRef } from 'react';

interface UrineSubStepProps {
  onTimerExpire?: () => void;
}

export const UrineSubStep: FC<UrineSubStepProps> = ({ onTimerExpire }) => {
  const [countdown, setCountdown] = useState(30);
  const [showWaterfall, setShowWaterfall] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Start countdown immediately
    const interval = setInterval(() => {
      setCountdown((prev) => {
        const newValue = prev - 1;

        // Show waterfall when countdown reaches 15 seconds
        if (newValue === 15) {
          setShowWaterfall(true);
          // Play audio when waterfall appears with looping
          const audio = new Audio('/audio/waterfall.mp3');
          audio.loop = true;
          audioRef.current = audio;
          audio.play().catch((err) => console.error('Error playing audio:', err));
        }

        // When countdown reaches 0, trigger onTimerExpire immediately
        if (newValue <= 0) {
          clearInterval(interval);
          if (onTimerExpire) {
            onTimerExpire();
          }
          return 0;
        }

        return newValue;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      // Stop and cleanup audio when component unmounts
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [onTimerExpire]);

  return (
    <div className="relative">
      {showWaterfall && (
        <div className="absolute -top-8 left-0 z-10">
          <img src="/gifs/waterfall.gif" alt="Waterfall" className="w-32 h-auto rounded-lg" />
        </div>
      )}
      <div className="text-center">
        <div>
          System needs a urine sample to verify that you're human.
          <br /> Please apply a urine sample on your reader
        </div>
        <div className="text-4xl font-bold mt-4">{countdown}s</div>
      </div>
    </div>
  );
};
