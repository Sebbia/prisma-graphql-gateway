# Prisma GraphQL gateway

This container starts Apollo GraphQL server as gateway to other GraphQL endpoints. It also starts Prisma GraphQL playground targeted to this gate.

## Usage

Env vars:
* **ENDPOINTS** (string, uri`s split by coma) - to define remote endpoints to services behind gateway
* **EXTERNAL_URI** (string) - to define service graphql endpoint, default `/`
* **WS_ENABLE** (bool) - enable subscriptions in service, default `false`
* **SENTRY_ENABLE** (bool) - enable Sentry, default `false`
* **SENTRY_DSN** (string) - Sentry dsn url
* **SENTRY_RELEASE** (string) - Sentry release version, default `dev`
* **SENTRY_ENV** (string) - Sentry environment, default `debug`


Sample `docker-compose.yml` can look like this:
```
version: '2'
services:
    prisma:
        image: prisma-graphql-gateway
        ports:
            - 4000:4000
        environment:
            - ENDPOINTS=http://sampleservice1/graphql,http://sampleservice2/graphql
```