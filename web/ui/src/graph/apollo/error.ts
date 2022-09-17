import { onError } from "@apollo/client/link/error"
import * as Sentry from "@sentry/react"

// https://dev.to/namoscato/graphql-observability-with-sentry-34i6
export const errorLink = onError(
  ({ operation, graphQLErrors, networkError }) => {
    Sentry.withScope((scope) => {
      scope.setTransactionName(operation.operationName)
      scope.setContext("apolloGraphQLOperation", {
        operationName: operation.operationName,
        variables: operation.variables,
        extensions: operation.extensions,
      })

      graphQLErrors?.forEach((error) => {
        Sentry.captureMessage(error.message, {
          level: Sentry.Severity.Error,
          fingerprint: ["{{ default }}", "{{ transaction }}"],
          contexts: {
            apolloGraphQLError: {
              error: JSON.stringify(error, null, 2),
              message: error.message,
              extensions: error.extensions,
            },
          },
        })
      })

      if (networkError) {
        Sentry.captureMessage(networkError.message, {
          level: Sentry.Severity.Error,
          contexts: {
            apolloNetworkError: {
              error: networkError,
              extensions: (networkError as any).extensions,
            },
          },
        })
      }
    })
  }
)
