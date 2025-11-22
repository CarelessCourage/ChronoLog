import { useStepper } from '@/components/StepperProvider';
import { StepperFormBox } from '@/components/StepperFormBox.tsx';
import { RetroButton } from '@/components/ui/retro-button';
import { useEffect, useRef, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { sendVictorToast } from '@/lib/victor.tsx';
import { useElevenLabs } from '@/lib/elevenlabs';

const MOVEMENT_THRESHOLD = 1000; // Total movement needed to pass
const MOTION_THRESHOLD = 100; // Minimum difference to count as motion
const SAMPLE_SIZE = 10; // Sample every 10 pixels
const SCALE_FACTOR = 20; // Scale down video for performance
const TIME_LIMIT = 30; // 30 seconds to complete the dance

export function DanceVerificationStep() {
  const { nextStep } = useStepper();
  const { speak } = useElevenLabs();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [danceProgress, setDanceProgress] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(TIME_LIMIT);
  const previousFrameRef = useRef<number[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const videoReadyRef = useRef(false);
  const isDetectingRef = useRef(false);
  const timerIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          videoReadyRef.current = true;

          // Initialize canvas size
          if (canvasRef.current && videoRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth / SCALE_FACTOR;
            canvasRef.current.height = videoRef.current.videoHeight / SCALE_FACTOR;
            console.log(
              'Canvas initialized:',
              canvasRef.current.width,
              'x',
              canvasRef.current.height
            );
          }
        };

        setIsStreaming(true);
        setError('');
      }
    } catch (err) {
      setError('Unable to access webcam. Please grant camera permissions.');
      console.error('Webcam error:', err);
    }
  };

  const calculateMotion = (): number => {
    if (!videoRef.current || !canvasRef.current || !videoReadyRef.current) {
      return 0;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) {
      return 0;
    }

    // Draw scaled down video for better performance
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Initialize previous frame on first run
    if (previousFrameRef.current.length === 0) {
      previousFrameRef.current = Array.from(currentFrame.data);
      console.log('First frame captured');
      return 0;
    }

    let motionPixels = 0;

    // Sample pixels in a grid pattern for performance
    for (let y = 0; y < canvas.height; y += SAMPLE_SIZE) {
      for (let x = 0; x < canvas.width; x += SAMPLE_SIZE) {
        const pos = (x + y * canvas.width) * 4;

        // Compare red channel (sufficient for motion detection)
        const rDiff = Math.abs(currentFrame.data[pos] - previousFrameRef.current[pos]);

        // If difference is above threshold, count it as motion
        if (rDiff > MOTION_THRESHOLD) {
          motionPixels++;
        }
      }
    }

    // Store current frame for next comparison
    previousFrameRef.current = Array.from(currentFrame.data);

    // Calculate motion as percentage of sampled pixels
    const sampledPixels = (canvas.width / SAMPLE_SIZE) * (canvas.height / SAMPLE_SIZE);
    const motionPercentage = (motionPixels / sampledPixels) * 100;

    console.log('Motion detected:', motionPercentage.toFixed(2) + '%', 'pixels:', motionPixels);

    return motionPercentage;
  };

  const detectMotion = () => {
    if (!isDetectingRef.current) {
      console.log('Detection stopped');
      return;
    }

    const motion = calculateMotion();

    setDanceProgress((prev) => {
      const newProgress = Math.min(prev + motion, MOVEMENT_THRESHOLD);

      // Check if threshold reached
      if (newProgress >= MOVEMENT_THRESHOLD) {
        console.log('Threshold reached!');
        isDetectingRef.current = false;
        setIsDetecting(false);
        setTimeout(() => {
          nextStep();
        }, 500);
        return MOVEMENT_THRESHOLD;
      }

      return newProgress;
    });

    // Always continue the loop
    animationFrameRef.current = requestAnimationFrame(detectMotion);
  };

  const startDancing = () => {
    isDetectingRef.current = true;
    setIsDetecting(true);
    setDanceProgress(0);
    setTimeRemaining(TIME_LIMIT);
    previousFrameRef.current = [];
    startTimeRef.current = Date.now();

    // Speak instruction
    speak('Show me your moves! Dance like nobody is watching.');

    // Start the timer
    timerIntervalRef.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, TIME_LIMIT - elapsed);
      setTimeRemaining(remaining);

      if (remaining === 0) {
        // Time's up!
        stopDancing();
        sendVictorToast("Time's up! Are you even trying to dance, or are you just... buffering?", {
          isViolation: true,
        });
      }
    }, 100);

    detectMotion();
  };

  const stopDancing = () => {
    isDetectingRef.current = false;
    setIsDetecting(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const progressPercentage = (danceProgress / MOVEMENT_THRESHOLD) * 100;

  return (
    <StepperFormBox
      title="Dance Verification"
      description="Prove you're human by dancing! Move around until the meter fills up."
    >
      <div className="space-y-6">
        {/* Webcam feed */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video ref={videoRef} className="w-full h-64 object-cover" autoPlay playsInline muted />
          <canvas ref={canvasRef} className="hidden" />

          {!isStreaming && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <p className="text-white text-sm">Camera not started</p>
            </div>
          )}

          {isDetecting && (
            <div className="absolute top-4 left-4 right-4">
              <div className="bg-black/70 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between text-white text-sm mb-2">
                  <span>Dance Meter</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <div className="flex items-center justify-between text-white text-xs mt-2">
                  <span>Time Remaining</span>
                  <span className={timeRemaining <= 5 ? 'text-red-400 font-bold' : ''}>
                    {timeRemaining}s
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && <div className="text-sm text-red-600 font-medium text-center">{error}</div>}

        {/* Controls */}
        <div className="space-y-3">
          {!isStreaming ? (
            <RetroButton onClick={startWebcam} className="w-full">
              Start Camera
            </RetroButton>
          ) : (
            <>
              {!isDetecting ? (
                <RetroButton onClick={startDancing} size="lg" className="w-full">
                  🕺 Start Dancing!
                </RetroButton>
              ) : (
                <RetroButton onClick={stopDancing} variant="secondary" size="lg" className="w-full">
                  ⏸️ Stop
                </RetroButton>
              )}
            </>
          )}
        </div>

        <div className="text-xs text-gray-500 text-center">
          💡 Tip: Move your arms, jump, or wave at the camera! You have {TIME_LIMIT} seconds.
        </div>
      </div>
    </StepperFormBox>
  );
}
