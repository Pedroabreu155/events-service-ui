import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/login')({
  component: LoginComponent,
})

function LoginComponent() {
  const [apiKey, setApiKey] = useState('')
  const showKey = false
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Simulating a small delay for better UX feel
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const validApiKey = import.meta.env.VITE_API_KEY

      if (apiKey === validApiKey) {
        sessionStorage.setItem('apiKey', apiKey)
        // Usando navigate em vez de window.location.href para manter o estado do app
        // e evitar reload desnecessário se possível, mas aqui como App lê do sessionStorage
        // no mount, um reload pode ser necessário se não usarmos o context corretamente.
        // No entanto, TanStack Router lida bem com isso se passarmos o context novo.
        window.location.href = '/dashboard'
      } else {
        alert('API Key inválida. Verifique suas credenciais.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="w-full max-w-[420px] px-6 py-12 relative z-10 mx-auto mt-[10vh]">
      {/* Evolution Manager Style Login Card */}
      <div className="bg-surface-container/60 backdrop-blur-2xl rounded-xl border border-outline-variant/15 glass-glow jewel-shadow p-8 flex flex-col items-center">
        {/* Logo Placeholder */}
        <div className="mb-8 flex flex-col items-center">
          <div className="w-12 h-12 bg-primary-container flex items-center justify-center rounded-lg mb-4">
            <span className="material-symbols-outlined text-on-primary-container text-2xl">
              terminal
            </span>
          </div>
          <h2 className="text-[#00A878] font-headline font-black text-lg tracking-[0.05em] uppercase">
            Events Service
          </h2>
        </div>
        {/* Form */}
        <form onSubmit={handleLogin} className="w-full space-y-6">
          <div className="space-y-2">
            <label
              className="block text-[10px] uppercase tracking-[0.1em] font-bold text-on-secondary-container"
              htmlFor="apikey"
            >
              Global API Key 
            </label>
              <input
                className="w-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface px-4 py-3 rounded-md focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200 outline-none text-sm font-mono placeholder:text-surface-container-highest"
                id="apikey"
                placeholder="Your Global API Key"
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={isSubmitting}
              />
          </div>
          {/* Primary CTA */}
          <button
            className="w-full bg-primary-container hover:bg-primary-fixed-dim text-on-primary-fixed font-headline font-bold py-3 px-6 rounded-md transition-all duration-200 active:scale-[0.98] jewel-shadow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={isSubmitting || !apiKey}
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-on-primary-fixed"></div>
            ) : (
              <>
                Authenticate
                <span className="material-symbols-outlined text-lg">
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </form>
      </div>
      {/* Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        {/* Top Left Radial Glow */}
        <div
          className="absolute -top-1/4 -left-1/4 w-[60%] h-[60%] rounded-full opacity-20 blur-[120px]"
          style={{
            background: 'radial-gradient(circle, #00A878 0%, transparent 70%)',
          }}
        ></div>
        {/* Bottom Right Radial Glow */}
        <div
          className="absolute -bottom-1/4 -right-1/4 w-[60%] h-[60%] rounded-full opacity-10 blur-[120px]"
          style={{
            background: 'radial-gradient(circle, #00A878 0%, transparent 70%)',
          }}
        ></div>
      </div>
    </main>
  )
}
