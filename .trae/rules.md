---
name: "events-service-ui-rules"
description: "Regras do workspace para manter consistência (estrutura, React/TS, TanStack Router/Query, Zod, testes, estilo)."
---

# Regras do projeto (Events Service UI)

## Estrutura e organização

- Componentes ficam em `src/components/<domínio>`:
  - `ui`: reutilizáveis/atômicos
  - `layout`: estrutura de página/containers
  - `dashboard`: componentes específicos do dashboard
  - `auth`: componentes de autenticação
- Rotas são file-based em `src/routes` usando TanStack Router.
- Hooks ficam em `src/hooks` e orquestram chamadas de API + Query.
- Tipos/contratos (especialmente de API) preferencialmente em `src/types` com Zod.

## Convecções de código (React/TS)

- Preferir exports nomeados: `export function X()` (evitar default export).
- Sem `any`. Se necessário, usar `unknown` e validar/estreitar com Zod.
- Preferir `import type { ... }` para tipos de React/TS.
- Componentes devem ser funcionais e com hooks quando necessário.
- Side-effects e regras de negócio fora de componentes (preferir hooks/services).

## Estilo (Tailwind)

- Usar Tailwind para estilo.
- Evitar CSS novo; quando inevitável, concentrar em `src/styles/globals.css`.
- Para classnames dinâmicos:
  - Se existir utilitário de merge (ex: `cn`), usar.
  - Se não existir e for recorrente, criar `src/utils/cn.ts` usando `clsx` + `tailwind-merge` (ambos já estão no projeto).

## API e autenticação

- Toda chamada HTTP passa por `src/services/api.ts`.
- A API Key é guardada em `sessionStorage` com chave `apiKey`.
- `api.ts` injeta `x-api-key` quando presente e dispara evento `unauthorized` em 401.
- Em rotas protegidas, checar autenticação no `beforeLoad` e redirecionar para `/login` (não esperar render).

## Dados e validação (TanStack Query + Zod)

- Dados do servidor: sempre TanStack Query v5 (`useQuery`, `useInfiniteQuery`, `useMutation`).
- Evitar `useState` para armazenar dados do backend (usar cache do Query).
- Sempre validar a resposta com Zod (`safeParse`) antes de usar no UI.
- Mensagens de erro voltadas ao usuário devem estar em PT-BR e ser claras (ex: “Resposta inválida do servidor”).
- `queryKey` deve incluir todos os filtros/params relevantes e ser determinístico.

## URL-first state (TanStack Router)

- Filtros/paginação/estado compartilhável: manter em `search` (URL).
- Usar `validateSearch` para normalizar `unknown` → tipos esperados.
- Atualizações de filtros: `navigate({ search: (prev) => ({ ...prev, ... }), replace: true })` quando fizer sentido.

## Testes (Vitest + Testing Library)

- Novo componente/hook significativo deve ter teste.
- Preferir testes centrados em comportamento (role/texto acessível).
- Para hooks com Query:
  - Mockar `api` via `vi.mock('../services/api', ...)`
  - Montar `QueryClientProvider`
  - Usar `renderHook`, `waitFor`, `act` conforme necessário

## Formatação (seguir o arquivo)

- O repositório mistura estilos; ao editar um arquivo, seguir o estilo local dele.
- Padrão observado:
  - `src/components`, `src/routes` e testes: aspas simples e geralmente sem ponto-e-vírgula.
  - `src/hooks`, `src/services`, `src/types`: frequentemente aspas duplas e ponto-e-vírgula.

## Não fazer

- Não logar segredos (API Key) nem imprimir headers sensíveis.
- Não criar estado duplicado do servidor fora do TanStack Query.
- Não adicionar comentários no código (a menos que solicitado explicitamente).
