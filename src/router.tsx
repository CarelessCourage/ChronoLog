import { Outlet } from '@tanstack/react-router';
import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { createBrowserHistory } from '@tanstack/history';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { TimePage } from '@/pages/TimePage';
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
  component: HomePage
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'login',
  component: LoginPage
});

const timeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'time',
  component: TimePage
});

const routeTree = rootRoute.addChildren([homeRoute, loginRoute, timeRoute]);

export const router = createRouter({
  routeTree,
  history: createBrowserHistory()
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
