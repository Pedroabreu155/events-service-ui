---
name: "create-route"
description: "Cria rota file-based do TanStack Router em src/routes com validateSearch, beforeLoad (auth) e componente. Use quando adicionar uma nova página/fluxo."
---

# Create Route (TanStack Router)

Cria uma nova rota no padrão file-based do TanStack Router, com validação de search params e (quando aplicável) proteção por autenticação.

## Quando usar

- Quando adicionar uma nova página em `src/routes`.
- Quando precisar de estado compartilhável via URL (filtros, paginação, etc.).

## Padrões do projeto a seguir

- Rotas em `src/routes/<nome>.tsx`
- `createFileRoute('/<path>')({ ... })`
- `validateSearch` deve normalizar e validar (`zod.safeParse` quando fizer sentido)
- Estado de filtros/inputs compartilháveis deve ir para `search` (URL-first)
- Para páginas protegidas, usar `beforeLoad` checando `sessionStorage.getItem('apiKey')` (como em `/dashboard`)
- Em `src/routes`, seguir o estilo observado (aspas simples e sem ponto-e-vírgula)

## Passo a passo

1. Escolha o path e o nome do arquivo:
   - `/foo` → `src/routes/foo.tsx`
   - `/foo/bar` → criar pasta/arquivo conforme a estratégia do projeto (se existir)
2. Modele os search params:
   - Converta `unknown` → string/number
   - Valide enums com schemas Zod existentes quando possível
3. Defina `beforeLoad` se a rota for protegida:
   - Redirecionar para `/login` se não autenticado
4. Implemente o componente:
   - Use componentes existentes (`DashboardLayout`, etc.) quando couber
   - Use `Route.useNavigate()` e `navigate({ search: (prev) => ({...prev}) })` para atualizar filtros

## Template (rota simples protegida)

```tsx
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/example')({
  beforeLoad: ({ context }) => {
    const isAuthenticated =
      context.isAuthenticated || !!sessionStorage.getItem('apiKey')
    if (!isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
  component: ExampleRouteComponent,
})

function ExampleRouteComponent() {
  return <div className="p-6 text-on-surface">Hello</div>
}
```

## Template (validateSearch com normalização)

```tsx
import { createFileRoute } from '@tanstack/react-router'

type Search = {
  q?: string
  page?: number
}

export const Route = createFileRoute('/search')({
  validateSearch: (search): Search => {
    const toSingleString = (value: unknown) => {
      if (typeof value === 'string') return value
      if (typeof value === 'number' && Number.isFinite(value)) return String(value)
      if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
      return undefined
    }

    const q = toSingleString(search.q)
    const pageRaw = toSingleString(search.page)

    const toNumber = (value?: string) => {
      if (!value) return undefined
      const parsed = Number(value)
      return Number.isFinite(parsed) ? parsed : undefined
    }

    const validated: Search = {}
    if (q) validated.q = q
    const page = toNumber(pageRaw)
    if (page !== undefined) validated.page = page
    return validated
  },
  component: SearchRouteComponent,
})

function SearchRouteComponent() {
  const search = Route.useSearch()
  return <div className="p-6 text-on-surface">q={search.q ?? '—'}</div>
}
```

## Checklist rápido

- A rota está em `src/routes` e usa `createFileRoute`?
- Search params são normalizados e validados?
- Se protegida, `beforeLoad` redireciona sem depender de render?
- Atualizações de filtros usam `navigate({ search: (prev) => ... , replace: true })` quando apropriado?
