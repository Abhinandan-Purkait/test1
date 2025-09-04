# syntax=docker/dockerfile:1.4
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --prefer-offline --no-audit --no-fund

COPY tsconfig.json ./
COPY src ./src
RUN npm run build:with-logo

FROM alpine:3.19
ARG PLUGIN_NAME=puls8-headlamp-plugin

RUN addgroup -S app && adduser -S app -G app
COPY --from=build /app/dist/main.js /plugins/${PLUGIN_NAME}/main.js
COPY --from=build /app/package.json /plugins/${PLUGIN_NAME}/package.json
RUN chown -R app:app /plugins

USER app
