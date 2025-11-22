import { useEffect, useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { useElevenLabs } from '@/lib/elevenlabs';
import { useBackgroundMusic } from '@/lib/backgroundMusic';
import { RetroButton } from '@/components/ui/retro-button';
import { Icon } from '@iconify/react';

gsap.registerPlugin(TextPlugin);

interface Scene {
  gif: string;
  text: string;
  duration: number;
}

const scenes: Scene[] = [
  {
    gif: '/gifs/hugeRuleBook.gif',
    text: 'The European Union has unleashed millions of new regulations.<br/> <br/> Cybercriminals lurk in every shadow, waiting to steal your lunch password.',
    duration: 5000,
  },
  {
    gif: '/gifs/officeInStorm.gif',
    text: "Some oil company's new time-reporting system is here.<br/> <br/> Built to comply with every dystopian directive. Designed by sadists.<br/> <br/> Protected by Viktor's paranoia.",
    duration: 5000,
  },
  {
    gif: '/gifs/manTypingAtComputer.gif',
    text: 'Viktor (with a K!) <br/> <br/> The man who turned security up to eleven',
    duration: 4000,
  },
  {
    gif: '/gifs/officeDesk.gif',
    text: 'And you? You just want to…',
    duration: 5000,
  },
];

export function IndexPage() {
  const navigate = useNavigate();
  const { playPreloaded, stopSpeaking, isSpeaking, isLoading, preloadVoices } = useElevenLabs();
  const { startAmbient } = useBackgroundMusic();
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [isPreloading, setIsPreloading] = useState(false);
  const [currentScene, setCurrentScene] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  // Preload all voices when component mounts
  useEffect(() => {
    const preloadAllVoices = async () => {
      setIsPreloading(true);
      const textsToPreload = scenes.map((scene) =>
        scene.text.replace(/<br\/>/g, ' ').replace(/<[^>]*>/g, '')
      );
      await preloadVoices(textsToPreload);
      setIsPreloading(false);
    };
    preloadAllVoices();
  }, [preloadVoices]);

  const handleStartGame = () => {
    // Start ambient sound
    startAmbient();
    setShowStartScreen(false);
  };

  // Auto-speak scene text when scene changes
  useEffect(() => {
    if (!showStartScreen && !isTransitioning) {
      const text = scenes[currentScene].text;
      const textForSpeech = text.replace(/<br\/>/g, ' ').replace(/<[^>]*>/g, '');
      playPreloaded(textForSpeech);
    }
  }, [currentScene, showStartScreen, isTransitioning, playPreloaded]);

  const handleTestAudio = async () => {
    console.log('Test audio button clicked');
    const text = scenes[currentScene].text.replace(/<br\/>/g, ' ').replace(/<[^>]*>/g, '');
    console.log('Attempting to play:', text);
    try {
      playPreloaded(text);
      console.log('Play completed');
    } catch (error) {
      console.error('Play failed:', error);
    }
  };

  const handleClick = () => {
    // Stop any currently playing speech
    stopSpeaking();

    if (currentScene < scenes.length - 1) {
      // Go to next scene with fade transition
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentScene(currentScene + 1);
        setIsTransitioning(false);
      }, 500);
    } else {
      // Last scene, go to login
      navigate({ to: '/login' });
    }
  }; // GSAP typewriter effect for scene text
  useEffect(() => {
    if (!showStartScreen && !isTransitioning && textRef.current) {
      const text = scenes[currentScene].text;
      textRef.current.textContent = '';

      gsap.to(textRef.current, {
        duration: text.length * 0.02,
        text: {
          value: text,
          delimiter: '',
        },
        ease: 'none',
      });
    }
  }, [currentScene, isTransitioning, showStartScreen]);

  // Start screen
  if (showStartScreen) {
    return (
      <>
        <div className="fixed inset-0 bg-black z-40" />
        <div className="min-h-screen flex flex-col items-center justify-center relative z-50 gap-4">
          {isPreloading ? (
            <div className="flex flex-col items-center gap-4">
              <Icon icon="line-md:loading-twotone-loop" className="w-16 h-16 text-white" />
              <span className="text-white text-xl font-semibold">Loading voices...</span>
            </div>
          ) : (
            <RetroButton onClick={handleStartGame} className="text-2xl px-8 py-4">
              Click to Start
            </RetroButton>
          )}
        </div>
      </>
    );
  }

  if (currentScene >= scenes.length) {
    return null;
  }

  const scene = scenes[currentScene];

  return (
    <>
      <div className="fixed inset-0 bg-black z-50" />
      {/* Loading Spinner */}
      {(isLoading || isSpeaking) && (
        <div className="fixed top-4 left-4 z-[60] flex items-center gap-2">
          <Icon icon="line-md:loading-twotone-loop" className="w-8 h-8 text-white" />
          <span className="text-white text-sm font-semibold">
            {isLoading ? 'Loading voice...' : 'Playing voice...'}
          </span>
        </div>
      )}
      {/* Debug Audio Button */}
      <RetroButton onClick={handleTestAudio} className="fixed top-4 right-4 z-[60]">
        🔊 Test Audio
      </RetroButton>
      <div
        className={`min-h-screen relative flex items-center justify-center cursor-pointer transition-opacity duration-500 z-50 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClick}
      >
        {/* Background GIF */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${scene.gif})` }}
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Text content */}
        <div
          style={{ minWidth: '56rem', minHeight: '30vh' }}
          className="relative z-10 max-w-4xl mx-auto px-8"
        >
          <p
            ref={textRef}
            className="text-2xl md:text-4xl text-white leading-relaxed whitespace-pre-line font-semibold drop-shadow-2xl"
          />
        </div>

        {/* Next indicator */}
        <div className="absolute bottom-8 right-8 text-white/60 text-sm">Click to continue</div>
      </div>
    </>
  );
}
