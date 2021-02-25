import * as Sentry from '@sentry/node';
import { mergeSchemas } from 'graphql-tools';
import { ApolloServer } from 'apollo-server';
import { ApolloServerExpressConfig } from 'apollo-server-express';
import { getRemoteExecutableSchemaFactory } from './utils/remote-schema'
import { getLoggingPlugin } from './utils/logging-plugin'
import { apolloServerSentryPlugin } from './utils/sentry-middleware'
import { ScopeIdGenerator, ScopeService } from './utils/scope-tools';
import { config, defaultLoggerFactory } from "./config";
import { formatApolloErrors } from 'apollo-server-errors';

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
const createRemoteExecutableSchemas = async (graphqlApis: string[]) => {
    let schemas = [];
    for (const api of graphqlApis) {
        schemas.push(createRemoteExecutableSchema(api, config.enableWS));
    }
    return Promise.all(schemas);
};
// @ts-ignore
// tslint: disable-next-line
async function createNewSchema(graphqlApis: string[]) {
    const schemas = await createRemoteExecutableSchemas(graphqlApis);
    return mergeSchemas({
        schemas
    });
}


const runServer = async () => {
    // Get newly merged schema
    const schema = await createNewSchema(config.graphqlApis);
    // start server with the new schema
    let serverConfig: ApolloServerExpressConfig = {
        schema,
        playground: config.enablePlayground && {
            endpoint: config.externalEndpoint
        },
        context: ({ connection, req }) => {
            let scope = scopeService.createScope("<e2b3ef70> Receive new request")
            mainLog.debug(`<feb1be2a> Old request connection: ${JSON.stringify(connection)}`)
            // get the user token from the headers
            let authKey = null;
            let headers = {};
            if (connection && connection.context && connection.context.Authorization && connection.context.Authorization.length > 0) {
                authKey = connection.context.Authorization
            } else {
                if (req) {
                    authKey = req.headers.authorization || undefined;
                    headers = req.headers;
                    mainLog.debug(`<feb1be2a> ${scope} Old request headers: ${JSON.stringify(req.headers)}`)
                }
            }

            // add the token to the context
            return {
                Authorization: authKey,
                OriginIp: req ? req.ip : null,
                ScopeHeader: config.scopeHeader,
                Scope: scope,
                AllHeaders: headers
            };
        },
        formatError: (error) => {
            mainLog.debug(`<8f11e079> Error: ${JSON.stringify(error)}`)
            mainLog.debug(`<69ff2427> Original Error: ${JSON.stringify(error.originalError)}`)

            //TODO: Refactor this to normal TypeScript
            let errors = [] as any[];

            if(!error.originalError || !(error.originalError as any).errors || (error.originalError as any).errors.length <= 0) {
                return error;
            }
        
            (error.originalError as any).errors.forEach((currentError: any) => {
                if(!currentError) return;
                let currentOriginal = currentError.originalError;
        
                const compiledErrors = formatApolloErrors(currentOriginal.errors || []);
        
                if(compiledErrors === null) {
                    return;
                }
        
                errors.push(...compiledErrors.filter(err => !!err));
            });
            return (errors.length > 1) ? errors : errors[0];
        }
    }
    if (config.enableWS) {
        serverConfig.subscriptions = {
            path: "/",
            keepAlive: 0,
            onDisconnect: (__, _) => {
                console.log(`<251a3131> WS Disconnect client from server`)
            }
        }
    }
    if (config.sentryConfig.enable) {
        serverConfig.plugins = [apolloServerSentryPlugin];
    }

    if (config.enableQueryLogging) {
        serverConfig.plugins = [getLoggingPlugin(defaultLoggerFactory.getLogger("QueryLogger"))];
    }

    const server = new ApolloServer(serverConfig);

    server.listen().then(({ url }) => {
        mainLog.info(`<6c9cda48> Running at ${url}`, { url: url })
    });
    // server.httpServer.setTimeout(10 * 60 * 1000);
};

try {
    runServer();
} catch (err) {
    mainLog.error(err);
}