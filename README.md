# Fin Flower Web

Front-end do Fin Flower em React + Vite. Consome a
[API](https://github.com/CaiioRodrigues/fin-flower-api) para autenticação; a tela
de lançamentos ainda usa `localStorage` e será migrada para os eventos da API.

## Funcionalidades

**Autenticação**

- Login e cadastro consumindo a API, com os erros por campo que ela devolve
- Sessão restaurada ao recarregar a página
- Renovação transparente do token: um 401 dispara o refresh e repete a chamada
- Rotas protegidas — quem não tem sessão vai para o login e volta para a página pretendida
- Logout revoga o refresh token no servidor

**Lançamentos** (ainda em `localStorage`)

- CRUD completo com validação, busca, filtro por tipo e resumo de saldo
- Layout responsivo

## Como rodar

Primeiro aponte para a API:

```bash
cp .env.example .env.local   # ajuste VITE_API_URL
npm install
npm run dev
```

A aplicação sobe em `http://localhost:5173`. A API precisa liberar essa origem no
CORS — o `appsettings.Development.json` dela já vem com ela configurada.

Outros comandos:

```bash
npm run build    # build de produção em dist/
npm run preview  # serve o build gerado
npm run lint     # ESLint
npm test         # Vitest
```

## Estrutura

```
src/
├── App.jsx                    # rotas públicas e protegidas
├── main.jsx                   # BrowserRouter + AuthProvider
├── api/
│   ├── client.js              # fetch com token, renovação e ProblemDetails
│   └── auth.js                # register / login / refresh / logout / me
├── auth/
│   ├── AuthProvider.jsx       # estado da sessão
│   ├── authContext.js         # contexto e hook useAuth
│   ├── tokenStorage.js        # access em memória, refresh no localStorage
│   ├── RequireAuth.jsx        # guarda das rotas privadas
│   └── RedirectIfAuthenticated.jsx
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   └── TransactionsPage.jsx
├── components/                # AppLayout, AuthLayout, Filters, Summary, ...
├── hooks/useTransactions.js
├── services/storage.js
├── styles/index.css
└── utils/format.js
```

## Como a sessão funciona

O **access token fica só em memória**: some ao fechar a aba e nunca é exposto a um
script que leia o `localStorage`. Apenas o **refresh token** é persistido, porque
sem ele a sessão não sobreviveria a um F5 — e como a API o rotaciona a cada uso,
um valor vazado deixa de valer no refresh seguinte.

Ao abrir a aplicação, se existe um refresh token, ele é trocado por um novo par
antes de qualquer decisão de rota. A guarda espera esse resultado; sem isso, quem
está logado seria expulso a cada recarga.

Quando uma chamada autenticada recebe 401, o cliente renova e repete a requisição
**uma única vez**. Se várias chamadas falharem juntas, todas aguardam o mesmo
refresh: dois refreshes simultâneos gastariam tokens da rotação e o servidor
derrubaria a sessão por reuso.

## Testes

```bash
npm test
```

`src/api/__tests__/client.test.js` cobre o cliente HTTP: envio do token, renovação
após 401, repetição única, fila em voo do refresh, encerramento da sessão quando a
renovação falha e a tradução dos erros por campo do `ProblemDetails`.
