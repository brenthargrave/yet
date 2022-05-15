import { createClient, defaultExchanges } from "@urql/core"
import { from, map, share } from "rxjs"
import { devtoolsExchange } from "@urql/devtools"

import { tag } from "~/log"
import { getId } from "./anon"
import {
  CreateVerificationDocument,
  CreateVerificationInput,
  CheckVerificationInput,
  CheckVerificationDocument,
  Event,
  EventName,
  EventProperties,
  TrackEventDocument,
  Verification,
  VerificationStatus,
} from "./generated"

export * from "./generated"

const client = createClient({
  url: "/graphql",
  exchanges: [devtoolsExchange, ...defaultExchanges],
})

export const verifyPhone$ = (input: CreateVerificationInput) =>
  from(client.mutation(CreateVerificationDocument, { input }).toPromise()).pipe(
    map(({ data, error }) => {
      if (error) throw error // TODO: extract into rxjs operator
      return data?.createVerification
    }),
    tag("verifyPhone$"),
    share()
  )

export const verifyCode$ = (input: CheckVerificationInput) =>
  from(client.mutation(CheckVerificationDocument, { input }).toPromise()).pipe(
    map(({ data, error }) => {
      if (error) throw error // TODO: extract into rxjs operator
      return data?.checkVerification
    }),
    tag("verifyCode$"),
    share()
  )

// Analytics
//

const anonId = getId()

export const track = async (
  name: EventName,
  properties: EventProperties = {}
): Promise<Event> => {
  const input = {
    anonId,
    name,
    properties,
  }
  const result = await client
    .mutation(TrackEventDocument, { input })
    .toPromise()
  return result.data?.trackEvent as Event
}
