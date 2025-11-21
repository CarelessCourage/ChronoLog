import { Outlet } from '@tanstack/react-router';
import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { createBrowserHistory } from '@tanstack/history';
import { AuthenticationPage } from '@/pages/AuthenticationPage';
import { TimePage } from '@/pages/TimePage';
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
  path: '/login',
  component: AuthenticationPage
});

const timeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'time',
  component: TimePage
});

const firedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'fired',
  component: FiredPage
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  timeRoute,
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
