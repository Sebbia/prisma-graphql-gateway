import WebSocket from 'ws';
import {
    SubscriptionClient
} from 'subscriptions-transport-ws';

const createWsLink = (gqlServerUrl) => {
    const wsUri = gqlServerUrl.replace("http://", "ws://").replace("https://", "wss://").replace(/\/+$/, '') + "/ws"
    console.log(`<d83d3314> WS link: ${wsUri}`);

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

export {
    createWsLink
};