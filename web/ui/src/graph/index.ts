import { createClient, defaultExchanges } from "@urql/core"
import { Observable, filter, from, map } from "rxjs"
import { devtoolsExchange } from "@urql/devtools"
import { isNotNullish } from "rxjs-etc"

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
  UserError,
  Error,
  VerificationResult,
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

// : Observable<Verification | UserError | >
export const verifyCode$ = (input: CheckVerificationInput) => {
  const foo = from(
    client.mutation(CheckVerificationDocument, { input }).toPromise()
  ).pipe(
    map(({ data, error }) => {
      if (error) throw error // TODO: extract into rxjs operator
      return data?.checkVerification
    }),
    filter(isNotNullish)
    // const res$: Observable<Verification | VerificationError> = result$.pipe(
    //   filter(isNotNullish)
    // )
    // const verification$: Observable<Verification> = res$.pipe(
    //   filter((res): res is Verification => res.__typename === "Verification")
    // )
  )
  return foo
}

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
