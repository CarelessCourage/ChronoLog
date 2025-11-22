import { useStepper } from '@/components/StepperProvider';
import { StepperFormBox } from '@/components/StepperFormBox.tsx';
import { RetroButton } from '@/components/ui/retro-button';
import { Progress } from '@/components/ui/progress';
import { useState, useRef, useEffect } from 'react';
import { sendVictorToast } from '@/lib/victor';

const DRAWING_THRESHOLD = 15; // Percentage of canvas that needs to be drawn on

export function DrawSelfPortraitStep() {
  const { nextStep } = useStepper();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingProgress, setDrawingProgress] = useState(0);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const drawnPixelsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const updateProgress = (x: number, y: number, size: number) => {
    // Mark pixels as drawn in a circle around the brush
    for (let dx = -size; dx <= size; dx++) {
      for (let dy = -size; dy <= size; dy++) {
        if (dx * dx + dy * dy <= size * size) {
          const key = `${Math.floor(x + dx)},${Math.floor(y + dy)}`;
          drawnPixelsRef.current.add(key);
        }
      }
    }

    // Calculate progress
    const canvas = canvasRef.current;
    if (!canvas) return;

    const totalPixels = canvas.width * canvas.height;
    const drawnPixels = drawnPixelsRef.current.size;
    const progress = (drawnPixels / totalPixels) * 100;
    setDrawingProgress(Math.min(progress, 100));
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const pos = getMousePos(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const pos = getMousePos(e);

    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    updateProgress(pos.x, pos.y, brushSize);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawnPixelsRef.current.clear();
    setDrawingProgress(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (drawingProgress < DRAWING_THRESHOLD) {
      sendVictorToast(
        `Impersonation detected! Your portrait is incomplete (${Math.floor(drawingProgress)}% drawn). You must provide a complete self-portrait for your security card. This is a serious violation of company policy.`,
        {
          channel: '#security-violations',
          isViolation: true,
        }
      );
      return;
    }

    // Drawing is sufficient, proceed
    nextStep();
  };

  return (
    <StepperFormBox
      title="Security Card Photo"
      description="Draw a self-portrait for your new security card. Draw enough detail to verify your identity."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm font-medium">Drawing Progress</div>
          <Progress value={drawingProgress} className="h-3" />
          <div className="text-xs text-muted-foreground">
            {Math.floor(drawingProgress)}% drawn (minimum {DRAWING_THRESHOLD}% required)
          </div>
        </div>

        <div className="border-2 border-border rounded-lg overflow-hidden bg-white w-full aspect-square max-w-md mx-auto">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="cursor-crosshair touch-none w-full h-full"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>

        <div className="flex gap-4 items-center">
          <div className="flex-1 space-y-2">
            <label htmlFor="color" className="text-sm font-medium">
              Color
            </label>
            <div className="flex gap-2 items-center">
              <input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-20 cursor-pointer rounded border border-border"
              />
              <div className="flex gap-1">
                {['#000000', '#ff0000', '#0000ff', '#00ff00', '#ffff00', '#ff00ff'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-8 h-8 rounded border-2 border-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <label htmlFor="brush-size" className="text-sm font-medium">
              Brush Size: {brushSize}px
            </label>
            <input
              id="brush-size"
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <RetroButton type="button" onClick={clearCanvas} variant="secondary" className="flex-1">
            Clear Canvas
          </RetroButton>
          <RetroButton type="submit" className="flex-1">
            Submit Portrait
          </RetroButton>
        </div>
      </form>
    </StepperFormBox>
  );
}
