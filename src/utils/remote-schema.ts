import fetch from 'cross-fetch';
import { getMainDefinition } from 'apollo-utilities';
import { introspectSchema, makeRemoteExecutableSchema } from 'graphql-tools';
import { HttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { wsLinkFactory } from './ws-link';
import { Logger } from 'logger';
import { onError } from 'apollo-link-error';

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create executable schemas from remote GraphQL APIs
 * @return {createRemoteExecutableSchema}
 */
function getRemoteExecutableSchemaFactory(logger: Logger) {
    let createWsLink = wsLinkFactory(logger)

    async function waitForEndpoint(endpoint: string) {
        while (true) {
            logger.debug(`<515d0545> Wait for ${endpoint} endpoint....`)
            try {
                let response = await fetch(endpoint, {
                    method: "POST",
                    body: '{"query":"{ __schema { types { name } }}"}',
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    }
                });

                if (response.ok)
                    break;

            } catch (e) {
                logger.warn(`<54aff403> Try reconnect to ${endpoint}`)
            }

            await sleep(1000);
        }

        logger.info(`<576ed8a5> Endpoint is ok: ${endpoint}`)
    }

    const createRemoteExecutableSchema = async (apiEndpoint: string, enableWS: boolean) => {
        await waitForEndpoint(apiEndpoint);
        try {
            const http = new HttpLink({
                uri: apiEndpoint,
                fetch
            });

            const context = setContext(function (_, previousContext) {
                let authKey;
                let scope;
                let scopeHeader;
                let originIp;
                let headers: any = {};
                if (previousContext.graphqlContext) {
                    authKey = previousContext.graphqlContext.Authorization;
                    scope = previousContext.graphqlContext.Scope
                    scopeHeader = previousContext.graphqlContext.ScopeHeader
                    originIp = previousContext.graphqlContext.OriginIp
                    headers = previousContext.graphqlContext.AllHeaders ? previousContext.graphqlContext.AllHeaders : {}
                }
                delete headers["host"];
                delete headers["origin"];
                delete headers["Origin"];

                if (authKey) {
                    delete headers['authorization']
                    headers['Authorization'] = `${String(authKey)}`
                } else {
                    delete headers['Authorization']
                    delete headers['authorization']
                }
                if (originIp) {
                    headers["X-Forwarded-For"] = originIp
                }
                if (scope && scopeHeader) {
                    headers[scopeHeader] = scope.id
                }
                logger.debug(`<10774738> ${scope} New request headers: ${JSON.stringify(headers)}`)
                return {
                    headers: headers
                }
            });

            let link;

            if (enableWS) {
                logger.debug(`<744143de> WS Link for ${apiEndpoint} enabled`)
                const wsLink = createWsLink(apiEndpoint)
                link = context.split(
                    ({ query }) => {
                        const def = getMainDefinition(query);
                        return def.kind === 'OperationDefinition' && def.operation === 'subscription';
                    },
                    wsLink,
                    http
                );
            } else {
                logger.debug(`<908668e6> WS Link for ${apiEndpoint} disabled`)
                link = context.concat(http)
            }

            const errorLink = onError((error) => {
                if (error.graphQLErrors) {
                    logger.debug(`<b8366ae1> Remote Server Errors: ${JSON.stringify(error.graphQLErrors)}`)
                }
            })

            const remoteSchema = await introspectSchema(link);
            const remoteExecutableSchema = makeRemoteExecutableSchema({
                schema: remoteSchema,
                link: errorLink.concat(link)
            });
            return remoteExecutableSchema;
        } catch (e) {
            logger.error(`<a35f5ac8> Failed while make remote executable schema for ${apiEndpoint}: ${e}`);
            throw e;
        }
    };

    return createRemoteExecutableSchema
}

export {
    getRemoteExecutableSchemaFactory
};