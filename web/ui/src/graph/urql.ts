import { createClient, defaultExchanges } from "@urql/core"
import { devtoolsExchange } from "@urql/devtools"

export const client = createClient({
  url: "/graphql",
  exchanges: [devtoolsExchange, ...defaultExchanges],
})
