'use client';

import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { Button } from '@/components/ui/button';

export function TopBar() {
  const router = useRouter();

  const handleLogout = () => {
    storage.auth.logout();
    router.push('/login');
  };

  return (
    <div className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">
          ChronoLog - Time Compliance Portal
        </h1>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </div>
  );
}
