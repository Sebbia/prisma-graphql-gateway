# Prisma GraphQL gateway

This container starts Apollo GraphQL server as gateway to other GraphQL endpoints. It also starts Prisma GraphQL playground targeted to this gate.

## Usage

Use ENDPOINTS environment variable to define remote endpoints to services behind gateway.

Sample `docker-compose.yml` can look like this:
```
version: '2'
services:
    prisma:
        image: prisma-graphql-gateway
        environment:
            - ENDPOINTS=http://sampleservice1/graphql,http://sampleservice2/graphql
```