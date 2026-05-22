# BUILD FRONTEND
FROM node:18-alpine AS frontend

WORKDIR /workshops-frontend/

COPY package.json ./
COPY package-lock.json ./
RUN npm install

COPY tailwind.config.js ./
COPY public/ ./public
COPY src/ ./src

ENV REACT_APP_API_BASEURL="/api"
ENV REACT_APP_API_BASEURL_V2="/api/v2"
ARG REACT_APP_POSTHOG_KEY
ARG REACT_APP_POSTHOG_HOST
ARG REACT_APP_VERSION="(version unknown)"
ARG REACT_APP_CHANNEL_FRIENDLY_NAME=""
ARG REACT_APP_ENABLE_EXTENDED_SETTINGS=false

RUN npm run build

# SERVER
FROM caddy:2.7.6-alpine

WORKDIR /
COPY Caddyfile /etc/caddy/Caddyfile

COPY --from=frontend /workshops-frontend/build/ /workshops-frontend/

EXPOSE 4000
