import { createContext, useContext, ReactNode } from 'react';

export interface PostItNote {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

interface PostItContextType {
  addPostIt: (note: Omit<PostItNote, 'id'>) => void;
}

const PostItContext = createContext<PostItContextType | null>(null);

export function usePostIts() {
  const context = useContext(PostItContext);
  if (!context) {
    throw new Error('usePostIts must be used within a PostItProvider');
  }
  return context;
}

export { PostItContext };
