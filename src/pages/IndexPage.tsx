import { useEffect, useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { useElevenLabs } from '@/lib/elevenlabs';

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
  const { speak, stopSpeaking } = useElevenLabs();
  const [currentScene, setCurrentScene] = useState(0);
  const [showTitle, setShowTitle] = useState(false);
  const [visibleWordCount, setVisibleWordCount] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const titleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRef = useRef<HTMLParagraphElement>(null);

  const allWords = ['Write.', 'Your.', 'Hours.'];

  const handleTestAudio = async () => {
    console.log('Test audio button clicked');
    const text = showTitle
      ? 'Write. Your. Hours.'
      : scenes[currentScene].text.replace(/<br\/>/g, ' ').replace(/<[^>]*>/g, '');
    console.log('Attempting to speak:', text);
    try {
      await speak(text);
      console.log('Speak completed');
    } catch (error) {
      console.error('Speak failed:', error);
    }
  };

  const handleClick = () => {
    // Stop any currently playing speech
    stopSpeaking();

    // On first click, speak the current scene
    if (!hasStarted) {
      setHasStarted(true);
      const text = scenes[currentScene].text;
      const textForSpeech = text.replace(/<br\/>/g, ' ').replace(/<[^>]*>/g, '');
      console.log('Speaking first scene:', textForSpeech);
      speak(textForSpeech);
      return;
    }

    if (showTitle && visibleWordCount === 3) {
      // If title is fully shown, go to login
      navigate({ to: '/login' });
    } else if (showTitle) {
      // Skip to showing all title words
      console.log('Speaking title');
      speak('Write. Your. Hours.');
      setVisibleWordCount(3);
    } else if (currentScene < scenes.length - 1) {
      // Go to next scene with fade transition
      setIsTransitioning(true);
      setTimeout(() => {
        const nextScene = currentScene + 1;
        setCurrentScene(nextScene);
        setIsTransitioning(false);
        // Speak the new scene's text after transition
        const text = scenes[nextScene].text;
        const textForSpeech = text.replace(/<br\/>/g, ' ').replace(/<[^>]*>/g, '');
        console.log('Speaking scene', nextScene, ':', textForSpeech);
        speak(textForSpeech);
      }, 500);
    } else {
      // Last scene, transition to title
      setIsTransitioning(true);
      setTimeout(() => {
        setShowTitle(true);
        setIsTransitioning(false);
      }, 500);
    }
  };

  useEffect(() => {
    if (showTitle && visibleWordCount === 0) {
      // Immediately show the first word when title screen appears
      setVisibleWordCount(1);
    } else if (showTitle && visibleWordCount < 3) {
      const wordTimer = setTimeout(() => {
        setVisibleWordCount((prev) => prev + 1);
      }, 600);

      return () => clearTimeout(wordTimer);
    }
  }, [showTitle, visibleWordCount]);

  // GSAP animation for title words
  useEffect(() => {
    if (showTitle && visibleWordCount > 0) {
      const element = titleRefs.current[visibleWordCount - 1];
      if (element) {
        gsap.fromTo(
          element,
          { opacity: 0, scale: 0.5 },
          { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
        );
      }
    }
  }, [showTitle, visibleWordCount]);

  // GSAP typewriter effect for scene text
  useEffect(() => {
    if (!showTitle && !isTransitioning && textRef.current) {
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
  }, [currentScene, showTitle, isTransitioning]);

  if (showTitle) {
    return (
      <>
        <div className="fixed inset-0 bg-black z-40" />
        {/* Debug Audio Button */}
        <button
          onClick={handleTestAudio}
          className="fixed top-4 right-4 z-[60] px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-lg"
        >
          🔊 Test Audio
        </button>
        <div
          className={`min-h-screen flex items-center justify-center cursor-pointer transition-opacity duration-500 relative z-50 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
          onClick={handleClick}
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
      {/* Debug Audio Button */}
      <button
        onClick={handleTestAudio}
        className="fixed top-4 right-4 z-[60] px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-lg"
      >
        🔊 Test Audio
      </button>
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
