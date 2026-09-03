# Fin Flower Web

Front-end do Fin Flower em React + Vite. Controle financeiro **por evento**:
cada evento soma suas entradas e saídas, e o caixa é a soma dos resultados.
Consome inteiramente a [API](https://github.com/CaiioRodrigues/fin-flower-api).

## Funcionalidades

**Autenticação**

- Login e cadastro consumindo a API, com os erros por campo que ela devolve
- Sessão restaurada ao recarregar a página
- Renovação transparente do token: um 401 dispara o refresh e repete a chamada
- Rotas protegidas — quem não tem sessão vai para o login e volta para a página pretendida
- Logout revoga o refresh token no servidor

**Contratos e fluxo de caixa**

- Contratos por evento, a receber (cliente) e a pagar (fornecedor), com forma de pagamento e parcelamento
- PDF do contrato anexado, aberto em aba nova pelo cliente autenticado
- Liquidação de parcela pré-preenchida e editável — ajusta valor, data e categoria quando houve desconto ou juros
- Estorno desfaz a parcela e o lançamento que ela criou
- Painel de fluxo de caixa: vencido, mês corrente, previsão mês a mês e saldo projetado
- Exportação em Excel e PDF: caixa por evento, fluxo de caixa, parcelas em aberto e extrato do evento

**Eventos**

- Lista com entradas, saídas e resultado de cada evento, filtrável por período e situação
- Criar, editar e excluir evento; fechar para consolidar e reabrir quando precisar
- Evento fechado esconde o formulário e as ações de lançamento

**Lançamentos**

- Cadastro, edição e exclusão dentro do evento, com validação e categorias
- Cada alteração relê o evento no servidor, para a tela mostrar o mesmo número que o caixa

**Caixa consolidado**

- Entradas, saídas e saldo do período, mais quantos eventos deram lucro, prejuízo ou fecharam no zero
- Layout responsivo — a tabela vira cards no mobile

## Como rodar

Primeiro aponte para a API:

```bash
cp .env.example .env.local   # ajuste VITE_API_URL
npm install
npm run dev
```

A aplicação sobe em `http://localhost:5173`, origem que a API já libera no CORS de
desenvolvimento.

A API roda em `http://localhost:5212` (e `https://localhost:7046`). Suba-a antes —
pelo Visual Studio com F5, ou com `dotnet run --project src/FinFlower.Api` — senão
o login falha por não haver com quem conversar.

Outros comandos:

```bash
npm run build    # build de produção em dist/
npm run preview  # serve o build gerado
npm run lint     # ESLint
npm test         # Vitest
```

## Com Docker

```bash
docker compose up -d --build
```

Serve o build em `http://localhost:5173` por nginx, com o fallback de rotas do
lado do cliente — sem ele, recarregar em `/eventos/123` daria 404.

O endereço da API é gravado no bundle **na construção da imagem**, porque é assim
que o Vite trata as variáveis `VITE_*`. Para apontar para outro lugar:

```bash
VITE_API_URL=http://localhost:5212 docker compose up -d --build
```

Esse endereço é o que o **navegador** usa, então é a porta publicada no host — não
o nome do serviço na rede do compose. A API precisa liberar `http://localhost:5173`
no CORS; o compose dela já faz isso.

## Identidade visual

A marca é uma flor com uma moeda no miolo — flor pelo formato, dinheiro pelo
centro. Fica legível a partir de 16px, que é o tamanho do favicon.

O **azul** é a cor da marca e das ações de criar. **Verde e vermelho ficam
reservados ao significado financeiro** — entrou dinheiro, saiu dinheiro — porque
usá-los também como cor de interface tiraria a força de quem precisa dela.

Os botões seguem o que a ação faz:

| Ação | Cor |
|---|---|
| Criar, adicionar, confirmar | Azul preenchido |
| Excluir | Vermelho preenchido, a ação mais forte da tela |
| Excel | Verde do Excel, tonalizado |
| PDF | Vermelho do PDF, tonalizado |

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
│   ├── EventsPage.jsx         # caixa, filtros e lista de eventos
│   ├── EventDetailPage.jsx    # evento, lançamentos e contratos
│   ├── ContractDetailPage.jsx # contrato, parcelas e documento
│   └── CashFlowPage.jsx       # vencido, mês corrente e previsão
├── components/                # AppLayout, CashSummary, EventList, EntryForm, ...
├── hooks/useAsync.js          # carregamento, erro e recarga
├── styles/index.css
└── utils/
    ├── format.js              # moeda e data em pt-BR
    ├── labels.js              # rótulos dos enums da API
    └── money.js               # máscara de dinheiro em centavos
```

`api/events.js` e `api/contracts.js` concentram as chamadas; nenhuma tela
monta URL na mão. O download de arquivo — PDF do contrato e relatórios — passa pelo cliente
autenticado e vira uma URL local; um link comum não levaria o token. O nome do
arquivo é decidido no front porque o `Content-Disposition` da resposta não é
legível pelo fetch entre origens sem expor o cabeçalho no CORS. `useAsync` descarta a resposta de uma chamada antiga quando
outra já começou — sem isso, trocar o filtro rápido deixaria a tela com o
resultado errado.

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

## Campos de dinheiro

O valor é digitado só com dígitos e a máscara monta da direita para a esquerda:
`123456` vira `1.234,56`. É a convenção dos sistemas financeiros brasileiros e
evita ambiguidade — não existe "digitei 1000, era mil reais ou dez reais?".

Internamente o cálculo é feito em **centavos inteiros**: `335.99 * 100` dá
`33598.999…` em ponto flutuante, e arredondar na conversão evita o centavo
perdido.

## Testes

```bash
npm test
```

`src/api/__tests__/client.test.js` cobre o cliente HTTP: envio do token, renovação
após 401, repetição única, fila em voo do refresh, encerramento da sessão quando a
renovação falha e a tradução dos erros por campo do `ProblemDetails`.

Os fluxos de tela foram verificados no navegador contra um stub que implementa o
mesmo contrato da API — autenticação, o cenário de cinco eventos com o caixa
fechando em R$ 14.000, filtro por período, edição e exclusão de lançamento com
recálculo do resultado, o congelamento do evento fechado, e o ciclo completo de
contrato: parcelamento de R$ 1.000 em 3x sem perder centavos, upload de PDF,
liquidação com desconto e estorno desfazendo os dois lados.
