import { SentryLink } from "apollo-link-sentry"

// https://dev.to/namoscato/graphql-observability-with-sentry-34i6
export const sentryLink = new SentryLink({
  setTransaction: false,
  setFingerprint: false,
  attachBreadcrumbs: {
    includeError: true,
  },
})
