# Fin Flower Web

CRUD simples de lançamentos financeiros feito em React + Vite. Os dados ficam
salvos no `localStorage` do navegador — não há backend.

## Funcionalidades

- **Create**: cadastro de lançamento (descrição, valor, data, tipo e categoria)
- **Read**: listagem com busca por descrição/categoria e filtro por tipo
- **Update**: edição de um lançamento existente no mesmo formulário
- **Delete**: exclusão com confirmação
- Resumo de receitas, despesas e saldo (calculado sobre o filtro atual)
- Validação de formulário e layout responsivo

## Como rodar

```bash
npm install
npm run dev
```

A aplicação sobe em `http://localhost:5173`.

Outros comandos:

```bash
npm run build    # build de produção em dist/
npm run preview  # serve o build gerado
npm run lint     # ESLint
```

## Estrutura

```
src/
├── App.jsx                    # composição da tela e estado de filtros/edição
├── main.jsx                   # bootstrap do React
├── components/
│   ├── Filters.jsx            # busca e filtro por tipo
│   ├── Summary.jsx            # cards de receitas/despesas/saldo
│   ├── TransactionForm.jsx    # formulário de criação e edição + validação
│   └── TransactionList.jsx    # tabela com ações de editar/excluir
├── hooks/
│   └── useTransactions.js     # operações do CRUD (create/update/remove)
├── services/
│   └── storage.js             # leitura e escrita no localStorage
├── styles/
│   └── index.css
└── utils/
    └── format.js              # formatação de moeda e data (pt-BR)
```

## Trocando por uma API

A persistência está isolada em `src/services/storage.js` e o CRUD em
`src/hooks/useTransactions.js`. Para usar um backend, basta substituir as
chamadas dessas duas camadas por `fetch`; os componentes não mudam.
