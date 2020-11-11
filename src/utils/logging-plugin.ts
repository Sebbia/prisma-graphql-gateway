import { Logger } from "logger";
import { ApolloServerPlugin, GraphQLRequestListener } from 'apollo-server-plugin-base';

/**
 * Create logging plugin with specified logger
 */
function getLoggingPlugin(logger: Logger): ApolloServerPlugin {
    // Fires whenever a GraphQL request is received from a client.
    return {
        requestDidStart(requestContext) {
            let scope = requestContext.context.Scope
            logger.debug(
                `${new Date().toISOString()}: <617d491b>  ${scope} Request received: \n` +
                `Auth: ${requestContext.context.Authorization} \n` +
                `Origin IP: ${requestContext.context.OriginIp} \n` +
                `Query: \n${requestContext.request.query}` +
                `Variables: ${JSON.stringify(requestContext.request.variables)}`
            );

            return {
                // Fires whenever Apollo Server will parse a GraphQL
                // request to create its associated document AST.
                // parsingDidStart(requestContext) {
                // console.log('Parsing started!');
                // },

                // Fires whenever Apollo Server will validate a
                // request's document AST against your GraphQL schema.
                // validationDidStart(requestContext) {
                // console.log('Validation started!');
                // }
            } as GraphQLRequestListener
        },
    } as ApolloServerPlugin
}

export {
    getLoggingPlugin
}