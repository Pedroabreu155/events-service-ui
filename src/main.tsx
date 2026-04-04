import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './styles/globals.css'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

const queryClient = new QueryClient()

// Create a new router instance
const router = createRouter({ 
  routeTree,
  context: {
    isAuthenticated: false, // Default
  }
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  // Simple check for authentication
  const isAuthenticated = !!sessionStorage.getItem('apiKey')

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} context={{ isAuthenticated }} />
      </QueryClientProvider>
    </StrictMode>
  )
}

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement)
  root.render(<App />)
}
