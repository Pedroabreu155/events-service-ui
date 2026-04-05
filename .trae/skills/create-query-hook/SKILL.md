---
name: "create-query-hook"
description: "Cria hook com TanStack Query v5 + Zod validando resposta da API (via src/services/api.ts) e teste com Vitest. Use quando precisar buscar/mutar dados do backend."
---

# Create Query Hook (TanStack Query + Zod)

Cria um hook para buscar dados do backend usando TanStack Query v5 e validação runtime com Zod, seguindo os padrões existentes do projeto.

## Quando usar

- Quando precisar consumir um endpoint HTTP no frontend.
- Quando quiser padronizar: schema Zod → type inferido → hook → teste mockando `api`.

## Padrões do projeto a seguir

- Chamadas HTTP sempre via `src/services/api.ts` (`api.get/post/...`)
- Validação de resposta com Zod (`safeParse` e erro claro em PT-BR)
- Server state sempre no TanStack Query (evitar `useState` para dados da API)
- Arquivo do hook em `src/hooks/use<Nome>.ts`
- Teste em `src/hooks/use<Nome>.test.tsx`
- Em `src/hooks`, siga o estilo observado no codebase (aspas duplas e ponto-e-vírgula). Em testes, siga aspas simples e sem ponto-e-vírgula.

## Passo a passo

1. Defina o contrato do endpoint:
   - Método (`GET/POST/...`), path e query params/body.
2. Crie um schema Zod para a resposta:
   - Preferir schema próximo do hook quando for específico.
   - Se for reutilizável/central, mover para `src/types`.
3. Inferir o tipo com `z.infer<typeof Schema>`.
4. Implementar o hook:
   - `useQuery` para listas/um item
   - `useInfiniteQuery` para paginação (como `useEvents`)
   - `queryKey` sempre estável e derivado dos filtros/params
5. Validar `response` com `Schema.safeParse`.
6. Teste:
   - Mockar `../services/api` com `vi.mock`
   - Usar `QueryClientProvider` e `renderHook`
   - Afirmar parâmetros enviados e shape do retorno

## Template (useQuery)

```ts
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "../services/api";

const ResponseSchema = z.object({
  items: z.array(z.string()),
});

type Response = z.infer<typeof ResponseSchema>;

export function useExample(params: { q?: string }) {
  return useQuery({
    queryKey: ["example", params],
    queryFn: async (): Promise<Response> => {
      const response = await api.get<Response>("/v1/example", {
        params: params.q ? { q: params.q } : undefined,
      });

      const parsed = ResponseSchema.safeParse(response);
      if (!parsed.success) {
        throw new Error("Resposta inválida do servidor");
      }

      return parsed.data;
    },
    retry: 0,
    staleTime: 30_000,
  });
}
```

## Template (teste do hook)

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { api } from '../services/api'
import { useExample } from './useExample'

vi.mock('../services/api', () => ({
  api: {
    get: vi.fn(),
  },
}))

describe('useExample', () => {
  it('fetches and validates data', async () => {
    const apiGetMock = vi.mocked(api.get)
    apiGetMock.mockResolvedValueOnce({ items: ['a'] })

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useExample({ q: 'x' }), { wrapper })

    await waitFor(() => {
      expect(result.current.data?.items).toEqual(['a'])
    })

    expect(apiGetMock).toHaveBeenCalledWith('/v1/example', {
      params: { q: 'x' },
    })
  })
})
```

## Checklist rápido

- `queryKey` inclui todos os params/filtros relevantes?
- `safeParse` está cobrindo o `response` antes de usar dados?
- O hook não está guardando dados do servidor em `useState`?
- Teste mocka `api` e valida os params enviados?
