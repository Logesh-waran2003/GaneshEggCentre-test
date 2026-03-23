import { createFileRoute, Outlet } from '@tanstack/react-router'
import { requireAuth } from '../lib/auth'

export const Route = createFileRoute('/purchases')({
  beforeLoad: requireAuth,
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
