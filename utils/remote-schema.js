import fetch from 'node-fetch';
import {getMainDefinition} from 'apollo-utilities';
import {introspectSchema, makeRemoteExecutableSchema} from 'graphql-tools';
import {HttpLink} from 'apollo-link-http';
import {setContext} from 'apollo-link-context';
import {wsLinkFactory} from './ws-link'

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * create executable schemas from remote GraphQL APIs
 * @param {Logger} logger
 * @return {createRemoteExecutableSchema}
 */
function getRemoteExecutableSchemaFactory(logger) {
    let createWsLink = wsLinkFactory(logger)

    async function waitForEndpoint(endpoint) {
        logger.debug(`<515d0545> Wait for ${endpoint} endpoint....`)
        while (true) {
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
                console.warn(`<54aff403> Try reconnect to ${endpoint}`)
            }

            await sleep(1000);
        }

        console.debug(`<576ed8a5> Endpoint is ok: ${endpoint}`)
    }

    const createRemoteExecutableSchema = async (apiEndpoint, enableWS) => {
        await waitForEndpoint(apiEndpoint);
        try {
            const http = new HttpLink({
                uri: apiEndpoint,
                fetch
            });

            const context = setContext(function (request, previousContext) {
                let authKey;
                let scope;
                let scopeHeader;
                let originIp;
                if (previousContext.graphqlContext) {
                    authKey = previousContext.graphqlContext.Authorization;
                    scope = previousContext.graphqlContext.Scope
                    scopeHeader = previousContext.graphqlContext.ScopeHeader
                    originIp = previousContext.graphqlContext.OriginIp
                }
                let headers = {}
                if (authKey) {
                    headers['Authorization'] = `${String(authKey)}`
                }
                if (originIp) {
                    headers ["X-Forwarded-For"] = originIp
                }
                if (scope && scopeHeader) {
                    headers[scopeHeader] = scope.id
                }
                console.debug(`<feb1be2a> ${scope} New request headers: ${JSON.stringify(headers)}`)
                return {
                    headers: headers
                }
            });

            let link;

            if (enableWS) {
                logger.debug(`<744143de> WS Link for ${apiEndpoint} enabled`)
                const wsLink = createWsLink(apiEndpoint)
                link = context.split(
                    ({query}) => {
                        const {kind, operation} = getMainDefinition(query);
                        return kind === 'OperationDefinition' && operation === 'subscription';
                    },
                    wsLink,
                    http
                );
            } else {
                console.debug(`<908668e6> WS Link for ${apiEndpoint} disabled`)
                link = context.concat(http)
            }

            const remoteSchema = await introspectSchema(link);
            const remoteExecutableSchema = makeRemoteExecutableSchema({
                schema: remoteSchema,
                link
            });
            return remoteExecutableSchema;
        } catch (e) {
            console.error(`<a35f5ac8> Failed while make remote executable schema for ${apiEndpoint}: ${e}`);
            throw e;
        }
    };

    return createRemoteExecutableSchema
}

export {
    getRemoteExecutableSchemaFactory
};