# BUILD FRONTEND
FROM node:18-alpine AS frontend

WORKDIR /workshops-frontend/

COPY public/ ./public
COPY src/ ./src
COPY package.json ./
COPY tailwind.config.js ./

ENV REACT_APP_API_BASEURL="/api"
ENV REACT_APP_API_BASEURL_V2="/api/v2"
ENV REACT_APP_POSTHOG_KEY="phc_9qcUXShTyQZi4PXtsx8F8FC1VvMdaGPXqNdC1vBfe7e"
ENV REACT_APP_POSTHOG_HOST="https://eu.i.posthog.com"

RUN npm install
RUN npm run build

# SERVER
FROM caddy:2.7.6-alpine

WORKDIR /
COPY Caddyfile /etc/caddy/Caddyfile

COPY --from=frontend /workshops-frontend/build/ /workshops-frontend/

EXPOSE 4000
