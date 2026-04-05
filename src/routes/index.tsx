import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    const isAuthenticated =
      context.isAuthenticated || !!sessionStorage.getItem('apiKey')
    if (isAuthenticated) {
      throw redirect({
        to: '/dashboard',
      })
    } else {
      throw redirect({
        to: '/login',
      })
    }
  },
})
