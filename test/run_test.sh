#!/bin/bash

set +x
set +e

TEST_URL="${1:-https://api.spacex.land/graphql}"

echo "TEST URL: ${TEST_URL}"

cd ..

docker build -t prisma-graphql-gateway-test:latest -f Dockerfile .

docker run -e ENDPOINTS="${TEST_URL}" -e PLAYGROUND_ENABLE=true -e WS_ENABLE=true -e QUERY_LOG_ENABLE=true -p 4000:4000 prisma-graphql-gateway-test:latest