import { Outlet } from '@tanstack/react-router';
import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { createBrowserHistory } from '@tanstack/history';
import { StepperPage } from '@/pages/LoginPage';
import { TimePage } from '@/pages/TimePage';
import { SuccessPage } from '@/pages/SuccessPage';
import { FiredPage } from '@/pages/FiredPage';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

const RootLayout = () => (
  <>
    <Outlet />
    {import.meta.env.DEV ? <TanStackRouterDevtools position="bottom-right" /> : null}
  </>
);

const rootRoute = createRootRoute({
  component: RootLayout
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: StepperPage
});

const timeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'time',
  component: TimePage
});

const successRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'success',
  component: SuccessPage
});

const firedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'fired',
  component: FiredPage
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  loginRoute,
  timeRoute,
  successRoute,
  firedRoute
]);

export const router = createRouter({
  routeTree,
  history: createBrowserHistory()
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
