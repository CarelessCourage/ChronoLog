import { useRef, useEffect, useState } from 'react';
import { StepperFormBox } from '@/components/StepperFormBox';
import { RetroButton } from '@/components/ui/retro-button';
import { useStepper } from '@/components/StepperProvider';

const FPS = 60;
const GRAVITY = 0.6;
const JUMP_VELOCITY = -12;
const GAME_SPEED = 6;
const SPEED_INCREMENT = 0.001;
const MAX_SPEED = 13;
const POINTS_TO_WIN = 50;

// Game dimensions
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 150;

// T-Rex config
const TREX_WIDTH = 44;
const TREX_HEIGHT = 47;
const TREX_X = 50;
const HORIZON_HEIGHT = 12;
const HORIZON_Y = 127; // Y position for horizon line
const BOTTOM_PAD = 10; // Small padding above horizon
const GROUND_Y = HORIZON_Y - TREX_HEIGHT + BOTTOM_PAD; // T-Rex stands ON the horizon line

// Detect HiDPI
const IS_HIDPI = window.devicePixelRatio > 1;

// Sprite positions (from Chrome T-Rex game source)
const SPRITE_POS = IS_HIDPI
  ? {
      TREX: { x: 1678, y: 2 },
      CACTUS_SMALL: { x: 446, y: 2 },
      CACTUS_LARGE: { x: 652, y: 2 },
      HORIZON: { x: 2, y: 104 },
      CLOUD: { x: 166, y: 2 },
    }
  : {
      TREX: { x: 848, y: 2 },
      CACTUS_SMALL: { x: 228, y: 2 },
      CACTUS_LARGE: { x: 332, y: 2 },
      HORIZON: { x: 2, y: 54 },
      CLOUD: { x: 86, y: 2 },
    };

// Obstacle config - yPos is where TOP of obstacle is drawn (bottom sits at horizon)
const OBSTACLES = [
  {
    type: 'CACTUS_SMALL',
    width: 17,
    height: 35,
    yPos: HORIZON_Y - 35 + BOTTOM_PAD, // Bottom sits on horizon
    sprite: SPRITE_POS.CACTUS_SMALL,
  },
  {
    type: 'CACTUS_LARGE',
    width: 25,
    height: 50,
    yPos: HORIZON_Y - 50 + BOTTOM_PAD, // Bottom sits on horizon
    sprite: SPRITE_POS.CACTUS_LARGE,
  },
];

// T-Rex animation frames (x offset in sprite)
const TREX_ANIM = {
  RUNNING: [88, 132], // Running animation frames
  JUMPING: [0], // Jump frame
  CRASHED: [220], // Crash frame
};

const MIN_GAP = 400;
const MAX_GAP = 800;

interface Obstacle {
  x: number;
  type: (typeof OBSTACLES)[number];
  passed: boolean;
}

export function NetworkErrorStep() {
  const { nextStep } = useStepper();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spriteRef = useRef<HTMLImageElement | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [canProceed, setCanProceed] = useState(false);
  const [spriteLoaded, setSpriteLoaded] = useState(false);

  // Game state refs
  const gameStateRef = useRef({
    isJumping: false,
    yPos: GROUND_Y,
    yVel: 0,
    score: 0,
    distance: 0,
    currentSpeed: GAME_SPEED,
    obstacles: [] as Obstacle[],
    animationId: null as number | null,
    lastTime: 0,
    animFrame: 0,
    animTimer: 0,
    horizonX: 0,
  });

  // Load sprite sheet
  useEffect(() => {
    const img = new Image();
    const spritePath = IS_HIDPI
      ? '/assets/default_200_percent/200-offline-sprite.png'
      : '/assets/default_100_percent/100-offline-sprite.png';

    console.log('Loading sprite from:', spritePath);
    console.log('IS_HIDPI:', IS_HIDPI);

    img.onload = () => {
      console.log('Sprite loaded successfully!', img.width, img.height);
      spriteRef.current = img;
      setSpriteLoaded(true);

      // Draw initial static frame to show something is there
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#f7f7f7';
          ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          console.log('Initial canvas drawn');
        }
      }
    };
    img.onerror = (e) => {
      console.error('Failed to load sprite sheet:', e);
      console.error('Attempted path:', spritePath);
    };
    img.src = spritePath;
  }, []);

  // Generate random gap between obstacles
  const getRandomGap = () => {
    return Math.random() * (MAX_GAP - MIN_GAP) + MIN_GAP;
  };

  // Get random obstacle type
  const getRandomObstacle = (): (typeof OBSTACLES)[number] => {
    return OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)];
  };

  // Check collision
  const checkCollision = (trexX: number, trexY: number, obstacle: Obstacle): boolean => {
    const trexLeft = trexX + 5;
    const trexRight = trexX + TREX_WIDTH - 5;
    const trexTop = trexY + 5;
    const trexBottom = trexY + TREX_HEIGHT - 5;

    const obstacleLeft = obstacle.x;
    const obstacleRight = obstacle.x + obstacle.type.width;
    const obstacleTop = obstacle.type.yPos - obstacle.type.height;
    const obstacleBottom = obstacle.type.yPos;

    return (
      trexRight > obstacleLeft &&
      trexLeft < obstacleRight &&
      trexBottom > obstacleTop &&
      trexTop < obstacleBottom
    );
  };

  // Draw the T-Rex using sprite
  const drawTRex = (ctx: CanvasRenderingContext2D, y: number, frame: number) => {
    if (!spriteRef.current) return;

    const sprite = spriteRef.current;
    // Frame is an X offset that needs to be scaled for HiDPI
    const frameOffset = IS_HIDPI ? frame * 2 : frame;
    const sourceX = SPRITE_POS.TREX.x + frameOffset;
    const sourceY = SPRITE_POS.TREX.y;
    const sourceW = IS_HIDPI ? TREX_WIDTH * 2 : TREX_WIDTH;
    const sourceH = IS_HIDPI ? TREX_HEIGHT * 2 : TREX_HEIGHT;

    ctx.drawImage(sprite, sourceX, sourceY, sourceW, sourceH, TREX_X, y, TREX_WIDTH, TREX_HEIGHT);
  };

  // Draw obstacle using sprite
  const drawObstacle = (ctx: CanvasRenderingContext2D, obstacle: Obstacle) => {
    if (!spriteRef.current) return;

    const sprite = spriteRef.current;
    const sourceW = IS_HIDPI ? obstacle.type.width * 2 : obstacle.type.width;
    const sourceH = IS_HIDPI ? obstacle.type.height * 2 : obstacle.type.height;

    // yPos is where the bottom of obstacle sits, so draw from yPos - height
    const drawY = obstacle.type.yPos;

    ctx.drawImage(
      sprite,
      obstacle.type.sprite.x,
      obstacle.type.sprite.y,
      sourceW,
      sourceH,
      obstacle.x,
      drawY,
      obstacle.type.width,
      obstacle.type.height
    );
  };

  // Draw horizon line using sprite
  const drawHorizon = (ctx: CanvasRenderingContext2D, xPos: number) => {
    if (!spriteRef.current) return;

    const sprite = spriteRef.current;
    const horizonWidth = 600;
    const sourceW = IS_HIDPI ? horizonWidth * 2 : horizonWidth;
    const sourceH = IS_HIDPI ? HORIZON_HEIGHT * 2 : HORIZON_HEIGHT;

    // Calculate positions for seamless scrolling
    // xPos tracks the offset, we need to draw two segments
    const pos1 = xPos;
    const pos2 = xPos + horizonWidth;

    // Draw first segment
    ctx.drawImage(
      sprite,
      SPRITE_POS.HORIZON.x,
      SPRITE_POS.HORIZON.y,
      sourceW,
      sourceH,
      pos1,
      HORIZON_Y,
      horizonWidth,
      HORIZON_HEIGHT
    );

    // Draw second segment for seamless scrolling
    ctx.drawImage(
      sprite,
      SPRITE_POS.HORIZON.x,
      SPRITE_POS.HORIZON.y,
      sourceW,
      sourceH,
      pos2,
      HORIZON_Y,
      horizonWidth,
      HORIZON_HEIGHT
    );
  };

  // Draw score
  const drawScore = (ctx: CanvasRenderingContext2D, score: number) => {
    ctx.fillStyle = '#535353';
    ctx.font = '16px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(Math.floor(score).toString().padStart(5, '0'), CANVAS_WIDTH - 20, 30);
  };

  // Game loop - use a stable wrapper
  const gameLoopImpl = (timestamp: number) => {
    console.log('gameLoop called at timestamp:', timestamp);
    const canvas = canvasRef.current;
    if (!canvas || !spriteRef.current) {
      console.log('gameLoop early return:', { canvas: !!canvas, sprite: !!spriteRef.current });
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('No canvas context');
      return;
    }

    const state = gameStateRef.current;
    const deltaTime = timestamp - state.lastTime;
    state.lastTime = timestamp;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Update horizon scroll
    state.horizonX -= state.currentSpeed;
    // Wrap horizon position for seamless scrolling
    if (state.horizonX <= -600) {
      state.horizonX += 600;
    }
    drawHorizon(ctx, state.horizonX);

    // Update T-Rex animation
    state.animTimer += deltaTime;
    if (state.animTimer > 1000 / 12 && !state.isJumping) {
      // Running animation
      const runFrames = TREX_ANIM.RUNNING;
      state.animFrame = (state.animFrame + 1) % runFrames.length;
      state.animTimer = 0;
    }

    // Update and draw T-Rex
    if (state.isJumping) {
      state.yVel += GRAVITY;
      state.yPos += state.yVel;

      if (state.yPos >= GROUND_Y) {
        state.yPos = GROUND_Y;
        state.isJumping = false;
        state.yVel = 0;
      }
      drawTRex(ctx, state.yPos, TREX_ANIM.JUMPING[0]);
    } else {
      drawTRex(ctx, state.yPos, TREX_ANIM.RUNNING[state.animFrame]);
    }

    // Update game speed
    state.currentSpeed = Math.min(GAME_SPEED + state.distance * SPEED_INCREMENT, MAX_SPEED);
    state.distance += state.currentSpeed * (deltaTime / 1000) * FPS;

    // Update obstacles
    for (let i = state.obstacles.length - 1; i >= 0; i--) {
      const obstacle = state.obstacles[i];
      obstacle.x -= state.currentSpeed;

      // Check collision
      if (checkCollision(TREX_X, state.yPos, obstacle)) {
        setIsGameOver(true);
        drawTRex(ctx, state.yPos, TREX_ANIM.CRASHED[0]);
        if (state.animationId) {
          cancelAnimationFrame(state.animationId);
          state.animationId = null;
        }
        return;
      }

      // Update score when passing obstacle
      if (!obstacle.passed && obstacle.x + obstacle.type.width < TREX_X) {
        obstacle.passed = true;
        state.score += 1;
        setScore(state.score);

        if (state.score >= POINTS_TO_WIN) {
          setCanProceed(true);
        }
      }

      // Draw obstacle
      if (obstacle.x + obstacle.type.width > 0) {
        drawObstacle(ctx, obstacle);
      } else {
        // Remove off-screen obstacles
        state.obstacles.splice(i, 1);
      }
    }

    // Add new obstacles
    if (
      state.obstacles.length === 0 ||
      state.obstacles[state.obstacles.length - 1].x < CANVAS_WIDTH - getRandomGap()
    ) {
      state.obstacles.push({
        x: CANVAS_WIDTH,
        type: getRandomObstacle(),
        passed: false,
      });
    }

    // Draw score
    drawScore(ctx, state.score);

    // Continue game loop
    state.animationId = requestAnimationFrame(gameLoopImpl);
  };

  const gameLoop = gameLoopImpl;

  // Handle jump
  const handleJump = () => {
    const state = gameStateRef.current;
    if (!state.isJumping && !isGameOver) {
      state.isJumping = true;
      state.yVel = JUMP_VELOCITY;
    }
  };

  // Start game
  const startGame = () => {
    console.log('startGame called, spriteLoaded:', spriteLoaded);
    if (!spriteLoaded) return;

    if (isGameOver) {
      // Reset game
      gameStateRef.current = {
        isJumping: false,
        yPos: GROUND_Y,
        yVel: 0,
        score: 0,
        distance: 0,
        currentSpeed: GAME_SPEED,
        obstacles: [],
        animationId: null,
        lastTime: 0,
        animFrame: 0,
        animTimer: 0,
        horizonX: 0,
      };
      setScore(0);
      setIsGameOver(false);
      setCanProceed(false);
    }

    console.log('Starting game...');
    setGameStarted(true);
    const state = gameStateRef.current;
    state.lastTime = performance.now();
    console.log('About to call requestAnimationFrame with gameLoop:', typeof gameLoop);

    // Test if RAF works at all
    requestAnimationFrame(() => {
      console.log('TEST: requestAnimationFrame callback executed!');
    });

    // Test calling gameLoopImpl directly
    console.log('Calling gameLoopImpl directly...');
    gameLoopImpl(performance.now());

    state.animationId = requestAnimationFrame(gameLoop);
    console.log('requestAnimationFrame returned animationId:', state.animationId);
  }; // Setup event listeners
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      console.log(
        'Key pressed:',
        e.code,
        'gameStarted:',
        gameStarted,
        'spriteLoaded:',
        spriteLoaded
      );
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (!gameStarted && spriteLoaded) {
          startGame();
        } else {
          handleJump();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (gameStateRef.current.animationId) {
        cancelAnimationFrame(gameStateRef.current.animationId);
      }
    };
  }, [gameStarted, isGameOver, spriteLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <StepperFormBox
      title="Network Connection Error"
      description="No internet connection detected. Recover connection by playing the game!"
    >
      <div className="space-y-6">
        {/* Chrome-style error message */}
        <div className="text-center space-y-2">
          <div className="text-6xl">🦖</div>
          <h2 className="text-2xl font-bold text-gray-700">Unable to connect</h2>
          <p className="text-gray-500">The authentication server is experiencing network issues.</p>
          <p className="text-sm text-gray-400">Error: ERR_NETWORK_CONNECTION_LOST</p>
        </div>

        {/* Game canvas */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative border-2 border-gray-300 rounded bg-[#f7f7f7]">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onClick={() => {
                console.log('Canvas clicked!');
                handleJump();
              }}
              className="cursor-pointer"
              style={{ imageRendering: 'pixelated' }}
            />

            {/* Loading overlay */}
            {!spriteLoaded && (
              <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-lg text-gray-700">Loading game...</p>
                </div>
              </div>
            )}

            {/* Game over overlay */}
            {isGameOver && spriteLoaded && (
              <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">Game Over!</h3>
                  <p className="text-gray-600 mb-4">Score: {score}</p>
                  <RetroButton onClick={startGame}>Retry</RetroButton>
                </div>
              </div>
            )}

            {/* Start overlay */}
            {!gameStarted && !isGameOver && spriteLoaded && (
              <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-lg text-gray-700 mb-4">
                    Press <kbd className="px-2 py-1 bg-gray-200 rounded">SPACE</kbd> to start
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Instructions and progress */}
          <div className="text-center space-y-2">
            <div className="text-sm text-gray-600">
              Jump over obstacles to score points. Reach {POINTS_TO_WIN} points to reconnect!
            </div>
            <div className="flex items-center gap-2 justify-center">
              <div className="text-2xl font-bold text-blue-600">{score}</div>
              <div className="text-gray-400">/</div>
              <div className="text-lg text-gray-600">{POINTS_TO_WIN}</div>
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-xs mx-auto h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${Math.min((score / POINTS_TO_WIN) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Continue button */}
          {canProceed && (
            <div className="flex flex-col items-center gap-2">
              <div className="text-green-600 font-semibold">✓ Connection restored!</div>
              <RetroButton onClick={nextStep}>Continue to Next Step</RetroButton>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>💡 Tip: Press SPACE or ↑ to jump</p>
          <p>The game speed increases as you progress</p>
        </div>
      </div>
    </StepperFormBox>
  );
}
