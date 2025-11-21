import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import { Toaster } from '@/components/ui/toaster';
import { credentials } from '@/lib/credentials';
import './index.css';

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
    color: "#fef08a" // yellow
  },
  {
    id: 2,
    text: "🍔 Don't forget lunch!\n10:30 - 11:00 PM",
    x: 320,
    y: 180,
    color: "#fed7aa" // orange
  }
];

function App() {
  const [postIts, setPostIts] = useState<PostItNote[]>(INITIAL_POSTITS);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (id: number, e: React.MouseEvent) => {
    const postIt = postIts.find(p => p.id === id);
    if (!postIt) return;
    
    setDraggingId(id);
    setDragOffset({
      x: e.clientX - postIt.x,
      y: e.clientY - postIt.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingId === null) return;
    
    setPostIts(prev =>
      prev.map(postIt =>
        postIt.id === draggingId
          ? {
              ...postIt,
              x: e.clientX - dragOffset.x,
              y: e.clientY - dragOffset.y
            }
          : postIt
      )
    );
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="relative"
    >
      <RouterProvider router={router} />
      <Toaster />
      
      {/* Post-it Notes */}
      {postIts.map(postIt => (
        <div
          key={postIt.id}
          className="fixed w-48 p-4 shadow-lg cursor-move select-none z-50 font-normal"
          style={{
            left: `${postIt.x}px`,
            top: `${postIt.y}px`,
            backgroundColor: postIt.color,
            transform: `rotate(${postIt.id % 2 === 0 ? '-2deg' : '2deg'})`,
            boxShadow: '2px 2px 8px rgba(0,0,0,0.15)',
          }}
          onMouseDown={(e) => handleMouseDown(postIt.id, e)}
        >
          <div className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">
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
