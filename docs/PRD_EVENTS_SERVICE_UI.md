1. Visão Geral
Este documento define a fundação técnica e os requisitos funcionais para a SPA do Events Service. A interface e o estilo visual serão extraídos via MCP Figma. A autenticação será baseada em API Key com ciclo de vida restrito à sessão do navegador.

2. Tech Stack Selecionada
Framework: React + Vite (TypeScript Strict Mode).

Roteamento & Auth Guard: TanStack Router (File-based).

Data Fetching: TanStack Query.

Estilização: Tailwind CSS + Shadcn UI (Via Figma MCP).

HTTP Client: Fetch API Nativa (Wrapper customizado).

Validação: Zod.

Persistência: sessionStorage (Segurança de sessão).

1. Arquitetura de Pastas
Plaintext
src/
  ├── components/
  │   ├── ui/         # Componentes base (extraídos do Figma)
  │   ├── layout/     # Sidebar, DashboardLayout
  │   └── dashboard/  # Tabela, Filtros, Metrics
  ├── hooks/          # useAuth (wrapper para sessionStorage), useEvents
  ├── routes/         # Estrutura de rotas do TanStack Router
  ├── services/       # api.ts (Fetch Wrapper + Injeção de Header)
  ├── types/          # Interfaces TS (Event, Status, Severity)
  └── utils/          # Parsers de Data e Erros
2. Requisitos Funcionais e Lógica
4.1 Ciclo de Vida da Autenticação
Armazenamento: A apiKey deve ser salva exclusivamente no sessionStorage.

Auth Guard (TanStack Router):

Utilizar a propriedade beforeLoad nas rotas protegidas (ex: /dashboard).

Verificar a existência da chave no sessionStorage.

Redirecionar para /login se a chave estiver ausente.

Logout: Função simples que limpa o sessionStorage e reseta o cache do TanStack Query.

4.2 Camada de API (Fetch Wrapper)
O arquivo src/services/api.ts deve ser o único ponto de saída para requisições:

Injeção Dinâmica: Buscar a chave do sessionStorage em tempo de execução para cada request.

Configuração:

Header: x-api-key.

Base URL: import.meta.env.VITE_API_URL.

Tratamento de Erro: Validar response.ok. Se retornar 401, o app deve limpar a sessão e redirecionar para o login.

4.3 Gestão de Eventos (TanStack Query)
Sincronização: As queries de eventos devem ser invalidadas/refetched quando os filtros na UI forem alterados.

Tipagem: Criar um Schema Zod para o objeto de Evento, garantindo que o frontend esteja em sincronia com o contrato da API Rest.

1. Diretrizes para o Trae (Solo Builder + Figma MCP)
Figma First: Use o MCP para gerar os componentes conforme o design. Ignore temas padrão do Shadcn se houver divergência com o Figma.

Contexto do Roteador: Injete o estado de autenticação no RouterContext para que todas as rotas tenham acesso fácil ao status de "logado".

Segurança: Garanta que nenhuma informação da API Key seja logada no console em ambiente de desenvolvimento.

Limpeza: Remova os arquivos boilerplate do Vite (App.css, logos, etc) antes de iniciar.

1. Variáveis de Ambiente (.env.example)
Snippet de código
VITE_API_URL=<http://localhost:3333>
2. Critérios de Aceite
[ ] Build realizado com sucesso (npm run build).

[ ] O acesso ao Dashboard é bloqueado se não houver chave no sessionStorage.

[ ] Fechar a aba do navegador desloga o usuário (comportamento do sessionStorage).

[ ] O interceptor de API injeta corretamente a chave em todas as chamadas.
