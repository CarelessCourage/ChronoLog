import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface TitleScreenProps {
  onComplete: () => void;
  onTitleComplete?: () => void;
}

export function TitleScreen({ onComplete, onTitleComplete }: TitleScreenProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const titleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const flashBangAudioRef = useRef<HTMLAudioElement | null>(null);
  const [visibleWordCount, setVisibleWordCount] = useState(0);

  const allWords = ['Write.', 'Your.', 'Hours.'];

  // Initialize flashbang audio
  useEffect(() => {
    flashBangAudioRef.current = new Audio('/audio/flashBang.mp3');
    flashBangAudioRef.current.volume = 0.8; // Higher ambient/SFX volume
  }, []);

  // Show words one by one
  useEffect(() => {
    if (visibleWordCount === 0) {
      // Start showing words immediately
      setVisibleWordCount(1);
    } else if (visibleWordCount < 3) {
      const wordTimer = setTimeout(() => {
        setVisibleWordCount((prev) => prev + 1);
      }, 600);

      return () => clearTimeout(wordTimer);
    }
  }, [visibleWordCount]);

  // GSAP animation for title words
  useEffect(() => {
    if (visibleWordCount > 0) {
      const element = titleRefs.current[visibleWordCount - 1];
      if (element) {
        // Play flashbang sound
        if (flashBangAudioRef.current) {
          flashBangAudioRef.current.currentTime = 0;
          flashBangAudioRef.current.play().catch((err) => {
            console.log('Failed to play flashbang:', err);
          });
        }

        gsap.fromTo(
          element,
          { opacity: 0, scale: 0.5 },
          { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
        );

        // If this is the last word, notify that title animation is complete
        if (visibleWordCount === 3 && onTitleComplete) {
          setTimeout(() => {
            onTitleComplete();
          }, 500); // Wait for animation to finish
        }
      }
    }
  }, [visibleWordCount, onTitleComplete]);

  const handleClick = () => {
    if (overlayRef.current) {
      // Slide away the overlay using clip-path
      gsap.to(overlayRef.current, {
        clipPath: 'inset(0 0 100% 0)',
        duration: 1.2,
        ease: 'power4.inOut',
        onComplete: () => {
          onComplete();
        },
      });
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black z-[100] flex items-center justify-center cursor-pointer"
      onClick={handleClick}
      style={{ clipPath: 'inset(0 0 0 0)' }}
    >
      <div className="text-center space-y-8">
        {allWords.map((word, index) => (
          <div
            key={index}
            ref={(el) => (titleRefs.current[index] = el)}
            className="text-8xl font-bold text-white font-pixel"
            style={{ opacity: 0 }}
          >
            {word}
          </div>
        ))}
      </div>
    </div>
  );
}
