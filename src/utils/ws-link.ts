import WebSocket from 'ws';
import { Logger } from 'logger';
import { ApolloLink } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';

function wsLinkFactory(logger: Logger) {
    const createWsLink = (gqlServerUrl: string) => {
        const wsUri = gqlServerUrl.replace("http://", "ws://").replace("https://", "wss://").replace(/\/+$/, '') + "/ws"
        logger.debug(`<d83d3314> WS link: ${wsUri}`);

        const link = new ApolloLink((operation) => {
            const context = operation.getContext();
            logger.debug(`<c329fbf7> WS Context: ${JSON.stringify(context)}`)
            const connectionParams = context.graphqlContext || {};
            const wsLink = new WebSocketLink({
                uri: wsUri,
                options: {
                    connectionParams,
                    reconnect: true,
                },
                webSocketImpl: WebSocket
            });
            return wsLink.request(operation)
        });

        return link
    };
    return createWsLink
}

export {
    wsLinkFactory
};