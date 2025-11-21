import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { storage } from '@/lib/storage';

export function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (storage.auth.isLoggedIn()) {
      navigate({ to: '/time', replace: true });
    } else {
      navigate({ to: '/login', replace: true });
    }
  }, [navigate]);

  return null;
}
