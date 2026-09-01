# Build ---------------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# O Vite grava as variáveis VITE_* no bundle: o endereço da API é decidido aqui,
# na construção da imagem, e não em tempo de execução.
ARG VITE_API_URL=http://localhost:5212
ENV VITE_API_URL=$VITE_API_URL

# npm ci a partir do lockfile: instalação reproduzível e cacheável enquanto as
# dependências não mudam.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime -------------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
