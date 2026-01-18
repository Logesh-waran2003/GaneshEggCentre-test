import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/sales')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
