import {
  createClient,
  dedupExchange,
  cacheExchange,
  fetchExchange,
  makeOperation,
} from "@urql/core"
import { authExchange, AuthConfig } from "@urql/exchange-auth"
import { devtoolsExchange } from "@urql/devtools"

// https://formidable.com/open-source/urql/docs/advanced/authentication/
// type AuthState = { token?: string }
// const authConfig: AuthConfig<AuthState> = {
//   getAuth: async ({ authState }) => {
//     if (!authState) {
//       const token = localStorage.getItem("token")
//       if (token) {
//         return { token }
//       }
//       return null
//     }

//     return null
//   },

//   addAuthToOperation: ({ authState, operation }) => {
//     if (!authState || !authState.token) {
//       return operation
//     }

//     const fetchOptions =
//       typeof operation.context.fetchOptions === "function"
//         ? operation.context.fetchOptions()
//         : operation.context.fetchOptions || {}

//     return makeOperation(operation.kind, operation, {
//       ...operation.context,
//       fetchOptions: {
//         ...fetchOptions,
//         headers: {
//           ...fetchOptions.headers,
//           Authorization: `Bearer ${authState.token}`,
//         },
//       },
//     })
//   },
// }

const client = createClient({
  url: "/graphql",
  exchanges: [
    devtoolsExchange,
    dedupExchange,
    cacheExchange,
    // authExchange(authConfig),
    fetchExchange,
  ],
})
