---
name: "create-component"
description: "Gera componente React (TS) nas pastas src/components (ui/layout/dashboard/auth) com props tipadas e teste. Use quando precisar criar/organizar um novo componente."
---

# Create Component (Events Service UI)

Cria um componente React em TypeScript na pasta correta do projeto e, quando fizer sentido, cria também o teste com Vitest + Testing Library.

## Quando usar

- Quando você precisar criar um componente novo (reutilizável, de layout ou específico de domínio).
- Quando você quiser padronizar onde o arquivo entra e como o teste nasce.

## Entrada mínima (o que perguntar / assumir)

- Nome do componente (PascalCase), ex: `EventCard`
- Categoria/pasta alvo:
  - `ui`: componente atômico e reutilizável
  - `layout`: componente estrutural (layout/páginas/containers)
  - `dashboard`: componente específico do dashboard
  - `auth`: componente de autenticação
- Props necessárias (tipos) e se aceita `className`
- Requisitos de acessibilidade (roles/labels) quando houver interação

## Regras do projeto a seguir

- Arquivo: `src/components/<categoria>/<Nome>.tsx`
- Export: sempre `export function Nome(...)` (sem default export)
- Tipos: sempre tipar props (sem `any`)
- Estilo: Tailwind (sem CSS novo; exceção: `src/styles/globals.css`)
- Formatação: em `src/components`, seguir o padrão observado (aspas simples e sem ponto-e-vírgula)

## Passo a passo

1. Escolha a pasta:
   - Se o componente é genérico e reutilizável: `src/components/ui`
   - Se organiza estrutura de página: `src/components/layout`
   - Se é específico de dashboard: `src/components/dashboard`
   - Se é específico de autenticação: `src/components/auth`
2. Crie o arquivo `.tsx` com:
   - `type <Nome>Props = { ... }`
   - `export function <Nome>(props: <Nome>Props) { ... }`
   - `type` imports usando `import type { ... } from 'react'` quando necessário
3. Se houver interações:
   - Use `button`/`input` nativos quando possível
   - Garanta `type="button"` em botões que não submetem forms
   - Garanta `aria-label`/texto visível para o elemento interativo
4. Crie teste quando fizer sentido:
   - Arquivo: `src/components/<categoria>/<Nome>.test.tsx`
   - Teste mínimo recomendado: renderiza e expõe algo acessível (texto/role)

## Template (componente)

Use este esqueleto e adapte props/markup:

```tsx
import type { ReactNode } from 'react'

type ComponentNameProps = {
  title: string
  children?: ReactNode
  className?: string
}

export function ComponentName({ title, children, className }: ComponentNameProps) {
  return (
    <section className={className}>
      <h2 className="text-sm font-black tracking-widest uppercase text-on-surface">
        {title}
      </h2>
      {children}
    </section>
  )
}
```

## Template (teste)

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ComponentName } from './ComponentName'

describe('ComponentName', () => {
  it('renders the title', () => {
    render(<ComponentName title="Hello" />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

## Checklist rápido antes de finalizar

- O componente está na pasta correta (`ui/layout/dashboard/auth`)?
- Props estão tipadas (sem `any`)?
- Sem default export?
- Não adicionou CSS novo fora de `globals.css`?
- Se há interação, existe algo acessível para testar (role/name)?
- Se aplicável, teste criado e passa?
