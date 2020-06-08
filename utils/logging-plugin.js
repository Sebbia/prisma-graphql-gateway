const loggingPlugin = {

    // Fires whenever a GraphQL request is received from a client.
    requestDidStart(requestContext) {
        console.log(
            `${new Date().toISOString()}: <617d491b> Request received: \n` +
            `Auth: ${requestContext.context.Authorization} \n` +
            `Origin IP: ${requestContext.context["X-Forwarded-For"]} \n` +
            `Query: \n${requestContext.request.query}` +
            `Variables: ${JSON.stringify(requestContext.request.variables)}`
        );

        return {

            // Fires whenever Apollo Server will parse a GraphQL
            // request to create its associated document AST.
            parsingDidStart(requestContext) {
                // console.log('Parsing started!');
            },

            // Fires whenever Apollo Server will validate a
            // request's document AST against your GraphQL schema.
            validationDidStart(requestContext) {
                // console.log('Validation started!');
            }

        }
    },
};

export {
    loggingPlugin
}