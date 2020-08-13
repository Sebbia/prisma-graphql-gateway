import * as Sentry from '@sentry/node';
import {mergeSchemas} from 'graphql-tools';
import {ApolloServer} from 'apollo-server';
import {getRemoteExecutableSchemaFactory} from './utils/remote-schema'
import {getLoggingPlugin} from './utils/logging-plugin'
import {apolloServerSentryPlugin} from './utils/sentry-middleware'
import {ScopeIdGenerator, ScopeService} from './utils/scope-tools';
import {config, defaultLoggerFactory} from "./config";

const scopeService = new ScopeService(new ScopeIdGenerator())
const mainLog = defaultLoggerFactory.getLogger("Main")

mainLog.info(`<7fd0acd3> Config for application:\n ${JSON.stringify(config, null, 2)}`, config)

if (config.sentryConfig.enable) {
    Sentry.init({
        environment: config.sentryConfig.environment,
        release: config.sentryConfig.release,
        dsn: config.sentryConfig.dsn,
    });
}

let createRemoteExecutableSchema = getRemoteExecutableSchemaFactory(defaultLoggerFactory.getLogger("RemoteSchema"))

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
    let serverConfig = {
        schema,
        playground: {
            endpoint: config.externalEndpoint,
            settings: {
                "schema.polling.enable": false
            }
        },
        context: ({connection, payload, req}) => {
            let scope = scopeService.createScope("<e2b3ef70> Receive new request")
            // get the user token from the headers
            let authKey = null;
            if (connection && connection.context && connection.context.Authorization) {
                authKey = connection.context.Authorization
            } else {
                if (req) {
                    authKey = req.headers.authorization || '';
                }
            }

            // add the token to the context
            return {
                Authorization: authKey,
                OriginIp: req ? req.ip : null,
                ScopeHeader: config.scopeHeader,
                Scope: scope
            };
        }
    }
    if (config.enableWS) {
        serverConfig.subscriptions = {
            path: "/"
        }
    }
    if (config.sentryConfig.enable) {
        serverConfig.plugins = [apolloServerSentryPlugin];
    }

    if (config.enableQueryLogging) {
        serverConfig.plugins = [getLoggingPlugin(defaultLoggerFactory.getLogger("QueryLogger"))];
    }

    const server = new ApolloServer(serverConfig);

    server.listen().then(({url}) => {
        mainLog.info(`<6c9cda48> Running at ${url}`, {url: url})
    });
    server.httpServer.setTimeout(10 * 60 * 1000);
};

try {
    runServer();
} catch (err) {
    mainLog.error(err);
}