import {FC, useState, useEffect, useRef} from 'react';

interface UrineSubStepProps {
    onTimerExpire?: () => void;
}

export const UrineSubStep: FC<UrineSubStepProps> = ({ onTimerExpire }) => {
    const [countdown, setCountdown] = useState(30);
    const [showWaterfall, setShowWaterfall] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (onTimerExpire) {
                onTimerExpire();
            }
        }, 30000);

        const waterfallTimer = setTimeout(() => {
            setShowWaterfall(true);
            // Play audio when waterfall appears with looping
            const audio = new Audio('/audio/waterfall.mp3');
            audio.loop = true;
            audioRef.current = audio;
            audio.play().catch(err => console.error('Error playing audio:', err));
        }, 15000);

        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearTimeout(timer);
            clearTimeout(waterfallTimer);
            clearInterval(interval);
            // Stop and cleanup audio when component unmounts
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [onTimerExpire]);

    return (
        <div className='relative'>
            {showWaterfall && (
                <div className="absolute -top-8 left-0 z-10">
                    <img
                        src="/gifs/waterfall.gif"
                        alt="Waterfall"
                        className="w-32 h-auto rounded-lg"
                    />
                </div>
            )}
            <div className="text-center">
                <div>
                    System needs a urine sample to verify that you're human.<br /> Please enter a urine sample on your reader
                </div>
                <div className="text-4xl font-bold mt-4">
                    {countdown}s
                </div>
            </div>
        </div>
    );
};