'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (storage.auth.isLoggedIn()) {
      router.push('/time');
    } else {
      router.push('/login');
    }
  }, [router]);

  return null;
}
