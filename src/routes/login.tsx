import { Outlet, createFileRoute } from '@tanstack/react-router';
import { StepperProvider } from '@/components/StepperProvider';

export const Route = createFileRoute('/login')({
  component: LoginLayout,
});

function LoginLayout() {
  return (
    <StepperProvider>
      <div className="min-h-screen flex flex-col">
        {/* Full page background */}
        <div
          className="fixed inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/gifs/officeDesk.gif)' }}
        />

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <Outlet />
        </div>
      </div>
    </StepperProvider>
  );
}
