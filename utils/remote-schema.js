import fetch from 'node-fetch';
import { getMainDefinition } from 'apollo-utilities';
import {
    makeRemoteExecutableSchema,
    introspectSchema
} from 'graphql-tools';
import { HttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { createWsLink } from './ws-link'

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForEndpoint(endpoint) {
    console.debug(`<515d0545> Wait for ${endpoint} endpoint....`)
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
            console.info(`<54aff403> Try reconnect to ${endpoint}`)
        }

        await sleep(1000);
    }

    console.debug(`<576ed8a5> Endpoint is ok: ${endpoint}`)
}

// create executable schemas from remote GraphQL APIs
const createRemoteExecutableSchema = async (apiEndpoint, enableWS) => {
    await waitForEndpoint(apiEndpoint);

    const http = new HttpLink({
        uri: apiEndpoint,
        fetch
    });

    const context = setContext(function (request, previousContext) {
        let authKey;
        if (previousContext.graphqlContext) {
            authKey = previousContext.graphqlContext.Authorization;
        };
        console.log("Child Authorization: " + authKey || 'None');
        if (authKey) {
            return {
                headers: {
                    'Authorization': `${String(authKey)}`,
                }
            }
        } else {
            return {
                headers: {}
            }
        }
    });

    let link;

    if (enableWS) {
        console.debug(`<744143de> WS Link for ${apiEndpoint} enabled`)
        const wsLink = createWsLink(apiEndpoint)
        link = context.split(
            ({
                query
            }) => {
                const {
                    kind,
                    operation
                } = getMainDefinition(query);
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
};

export {
    createRemoteExecutableSchema
};