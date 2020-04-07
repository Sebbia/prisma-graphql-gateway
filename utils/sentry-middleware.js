import * as Sentry from '@sentry/node';

const apolloServerSentryPlugin = {
  // For plugin definition see the docs: https://www.apollographql.com/docs/apollo-server/integrations/plugins/
  requestDidStart() {
    return {
      didEncounterErrors(rc) {
        Sentry.withScope((scope) => {
          scope.addEventProcessor((event) =>
            Sentry.Handlers.parseRequest(event, rc.context.req)
          );

          let operation;
          if(rc.operation && rc.operation.operation){
            operation = rc.operation.operation || 'parse_error'
          } else {
            operation = 'parse_error'
          }

          scope.setTags({
            graphql: operation,
            graphqlName: rc.operationName || rc.request.operationName,
          });

          rc.errors.forEach((error) => {
            if (error.path || error.name !== 'GraphQLError') {
              scope.setExtras({
                path: error.path,
              });
              Sentry.captureException(error);
            } else {
              scope.setExtras({});
              Sentry.captureMessage(`GraphQLWrongQuery: ${error.message}`);
            }
          });
        });
      },
    };
  },
};

export { apolloServerSentryPlugin }