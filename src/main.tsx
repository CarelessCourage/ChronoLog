import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { router } from './router';
import { Toaster } from '@/components/ui/toaster';
import { credentials } from '@/lib/credentials';
import { ElevenLabsProvider } from '@/lib/elevenlabs';
import { BackgroundMusicProvider } from '@/lib/backgroundMusic';
import './index.css';

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

interface PostItNote {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

const INITIAL_POSTITS: PostItNote[] = [
  {
    id: 1,
    text: credentials.getLoginInfo(),
    x: 120,
    y: 150,
    color: '#fef08a', // yellow
  },
  {
    id: 2,
    text: "🍔 Don't forget lunch!\n10:30 - 11:00 PM",
    x: 320,
    y: 180,
    color: '#fed7aa', // orange
  },
];

function App() {
  const [postIts, setPostIts] = useState<PostItNote[]>(INITIAL_POSTITS);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Subscribe to credential changes and add new login post-it
  useEffect(() => {
    let previousEmail = credentials.getEmail();

    const unsubscribe = credentials.subscribe(() => {
      const currentEmail = credentials.getEmail();

      // If email changed, it's a new identity - add a new post-it
      if (currentEmail !== previousEmail) {
        setPostIts((prev) => [
          ...prev,
          {
            id: Date.now(), // Use timestamp as unique ID
            text: credentials.getLoginInfo(),
            x: 120 + prev.length * 30, // Offset each new post-it
            y: 150 + prev.length * 30,
            color: '#fef08a', // yellow
          },
        ]);
        previousEmail = currentEmail;
      } else {
        // Password changed but not email - update existing post-it
        setPostIts((prev) =>
          prev.map((postIt) =>
            postIt.id === 1 ? { ...postIt, text: credentials.getLoginInfo() } : postIt
          )
        );
      }
    });

    return unsubscribe;
  }, []);

  // Subscribe to router changes
  useEffect(() => {
    // Initial path update
    setCurrentPath(router.state.location.pathname);

    // Subscribe to all router state changes
    const unsubscribe = router.subscribe('onBeforeLoad', ({ pathChanged }) => {
      if (pathChanged) {
        setCurrentPath(router.state.location.pathname);
      }
    });

    return unsubscribe;
  }, []);

  const handleMouseDown = (id: number, e: React.MouseEvent) => {
    const postIt = postIts.find((p) => p.id === id);
    if (!postIt) return;

    setDraggingId(id);
    setDragOffset({
      x: e.clientX - postIt.x,
      y: e.clientY - postIt.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingId === null) return;

    setPostIts((prev) =>
      prev.map((postIt) =>
        postIt.id === draggingId
          ? {
              ...postIt,
              x: e.clientX - dragOffset.x,
              y: e.clientY - dragOffset.y,
            }
          : postIt
      )
    );
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  const showPostIts = currentPath !== '/';

  return (
    <div onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} className="relative">
      <ConvexProvider client={convex}>
        <ElevenLabsProvider>
          <BackgroundMusicProvider>
            <RouterProvider router={router} />
          </BackgroundMusicProvider>
        </ElevenLabsProvider>
      </ConvexProvider>
      <Toaster />

      {/* Post-it Notes */}
      {showPostIts &&
        postIts.map((postIt) => (
          <div
            key={postIt.id}
            className="fixed w-48 p-4 shadow-lg cursor-move select-none z-50"
            style={{
              left: `${postIt.x}px`,
              top: `${postIt.y}px`,
              backgroundColor: postIt.color,
              transform: `rotate(${postIt.id % 2 === 0 ? '-2deg' : '2deg'})`,
              boxShadow: '2px 2px 8px rgba(0,0,0,0.15)',
              fontFamily: '"Just Me Again Down Here", cursive',
            }}
            onMouseDown={(e) => handleMouseDown(postIt.id, e)}
          >
            <div className="text-lg text-slate-800 whitespace-pre-line leading-relaxed">
              {postIt.text}
            </div>
          </div>
        ))}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
