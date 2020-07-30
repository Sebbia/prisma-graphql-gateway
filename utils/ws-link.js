import WebSocket from 'ws';
import {SubscriptionClient} from 'subscriptions-transport-ws';

function wsLinkFactory(logger) {
    const createWsLink = (gqlServerUrl) => {
        const wsUri = gqlServerUrl.replace("http://", "ws://").replace("https://", "wss://").replace(/\/+$/, '') + "/ws"
        logger.debug(`<d83d3314> WS link: ${wsUri}`);

        const link = (operation, forward) => {
            const context = operation.getContext();
            const connectionParams = context.graphqlContext || {};
            const client = new SubscriptionClient(wsUri, {
                connectionParams,
                reconnect: true,
            }, WebSocket, []);
            client.onDisconnected = () => {
                client.wsImpl.close()
                client.close()
            }
            return client.request(operation);
        };

        return link
    };
    return createWsLink
}

export {
    wsLinkFactory
};