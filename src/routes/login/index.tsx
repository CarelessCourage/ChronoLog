import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/login/')({
  beforeLoad: () => {
    // Redirect to the first step
    throw redirect({ to: '/login/password' });
  },
});
