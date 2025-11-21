import { useNavigate } from '@tanstack/react-router';
import { storage } from '@/lib/storage';
import { RetroButton } from '@/components/ui/retro-button';

export function TopBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    storage.auth.logout();
    navigate({ to: '/login', replace: true });
  };

  return (
    <div className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800 font-pixel">
          ChronoLog - Time Compliance Portal
        </h1>
        <RetroButton variant="outline" size="sm" onClick={handleLogout}>
          Log out
        </RetroButton>
      </div>
    </div>
  );
}
