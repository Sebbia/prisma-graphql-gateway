# Prisma GraphQL gateway

This container starts Apollo GraphQL server as gateway to other GraphQL endpoints. It also starts Prisma GraphQL playground targeted to this gate.

## Usage

Env vars:
* **ENDPOINTS** (string, uri`s split by coma) - to define remote endpoints to services behind gateway
* **EXTERNAL_URI** (string) - to define service graphql endpoint, default `/`
* **WS_ENABLE** (bool) - enable subscriptions in services, default `false`
* **QUERY_LOG_ENABLE** (bool) - enable query log in service, default `false`
* **SENTRY_ENABLE** (bool) - enable Sentry, default `false`
* **SENTRY_DSN** (string) - Sentry dsn url
* **SENTRY_RELEASE** (string) - Sentry release version, default `0.5`
* **SENTRY_ENV** (string) - Sentry environment, default `debug`
* **SCOPE_HEADER** (string) - Request scope header, default `Operation-Scope`
* **GELF_ENABLE** (bool) - enable GELF logger, default `false`
* **GELF_HOST** (string) - GELF host, required if GELF enabled
* **GELF_PORT** (int) - GELF port, default `12201`
* **GELF_PROTOCOL** (string) - GELF protocol, possible values: [`udp`, `tcp`, `tcp-tls`], default `udp`
* **DEPLOY_TYPE** (string) - Deploy type (only shown in Graylog), default `dev`
* **SERVICE_NAME** (string) - Service name (only shown in Graylog), default `prisma`
* **LOG_LEVEL** (string) - Service log level. Possible values: TRACE, DEBUG, INFO, WARN, ERROR. Default `INFO`


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

## Changelog:

### 0.7.5
* Send all request headers to backends

### 0.7.4
* Fix resolve origin ip from websocket
* Add quick test script

### 0.7.3
* Send extra data to GELF in json string instead object

### 0.7.2
* Add service name and deploy type to gelf logger

### 0.7.1
* Replace a forgotten console.log to own logger

### 0.7.0
* Add Gelf logger

### 0.6.0
* Add scope to every request to endpoints

### 0.5
* Add query logging
* From now, SENTRY_RELEASE by default is service version

### 0.4.3
Add `X-Forwarded-For` header to request