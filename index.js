import * as Sentry from '@sentry/node';
import {
  mergeSchemas
} from 'graphql-tools';
import {
  ApolloServer
} from 'apollo-server';
import {
  createRemoteExecutableSchema
} from './utils/remote-schema'
import { apolloServerSentryPlugin } from './utils/sentry-middleware'
import config from './config.js'

console.info(`<7fd0acd3> Config for application:\n ${JSON.stringify(config, null, 2)}`)

if(config.sentryConfig.enable){
  Sentry.init({
    environment: config.sentryConfig.environment,
    release: config.sentryConfig.release,
    dsn: config.sentryConfig.dsn,
  });
};

// create executable schemas from remote GraphQL APIs
const createRemoteExecutableSchemas = async (graphqlApis) => {
  let schemas = [];
  for (const api of graphqlApis) {
    schemas.push(createRemoteExecutableSchema(api, config.enableWS));
  }
  return Promise.all(schemas);
};

const createNewSchema = async (graphqlApis) => {
  const schemas = await createRemoteExecutableSchemas(graphqlApis);
  return mergeSchemas({
    schemas
  });
};

const runServer = async () => {
  // Get newly merged schema
  const schema = await createNewSchema(config.graphqlApis);
  // start server with the new schema
  var serverConfig = {
    schema,
    playground: {
      endpoint: config.externalEndpoint
    },
    context: ({
      connection,
      payload,
      req
    }) => {
      // get the user token from the headers
      if (connection && connection.context && connection.context.Authorization) {
        return {
          Authorization: connection.context.Authorization
        }
      }

      if (req) {
        const authKey = req.headers.authorization || '';
        console.log("<110e2fef> Parent Authorization: " + authKey);

        // add the token to the context
        return {
          Authorization: authKey
        };
      }
    }
  }
  if (config.enableWS) {
    serverConfig.subscriptions = {
      path: "/"
    }
  }
  if(config.sentryConfig.enable){
    serverConfig.plugins = [apolloServerSentryPlugin];
  }
  const server = new ApolloServer(serverConfig);

  server.listen().then(({
    url
  }) => {
    console.log(`<6c9cda48> Running at ${url}`);
  });
  server.httpServer.setTimeout(10 * 60 * 1000);
};

try {
  runServer();
} catch (err) {
  console.error(err);
}