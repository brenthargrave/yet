import { createClient, defaultExchanges } from "@urql/core"
import { from, map } from "rxjs"
import { devtoolsExchange } from "@urql/devtools"

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
    })
  )

export const verifyCode$ = (input: CheckVerificationInput) =>
  from(client.mutation(CheckVerificationDocument, { input }).toPromise()).pipe(
    map(({ data, error }) => {
      if (error) throw error // TODO: extract into rxjs operator
      return data?.checkVerification
    })
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
