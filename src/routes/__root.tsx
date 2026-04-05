import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'

interface MyRouterContext {
  isAuthenticated: boolean
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Outlet />
    </>
  ),
})
