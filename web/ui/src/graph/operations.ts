/* eslint @typescript-eslint/no-non-null-assertion: 0 */
/* eslint no-console: 0 */
/* eslint max-classes-per-file: 0 */

import { FetchPolicy, InternalRefetchQueriesInclude } from "@apollo/client"
import { TypedDocumentNode } from "@graphql-typed-document-node/core"
import { captureException, withScope } from "@sentry/react"
import { GraphQLError } from "graphql"
import { first } from "remeda"
import { catchError, from, map, Observable, of } from "rxjs"
import { Err, Ok, Result } from "ts-results"
import { makeTagger } from "~/log"
import { zenToRx } from "~/rx"
import { client } from "./apollo"
import {
  ErrorCode,
  Exact,
  Scalars,
  UserError as GraphUserError,
} from "./generated"

export { loggedIn, loggedOut } from "./driver"
export type { Commands, Source } from "./driver"
export * from "./generated"
export * from "./models"
export type ID = Scalars["ID"]

const tag = makeTagger("graph")

// NOTE: refs
// https://engineering.udacity.com/handling-errors-like-a-pro-in-typescript-d7a314ad4991
export class BaseError extends Error {}
export class UserError extends BaseError {
  message: string

  code?: ErrorCode

  cause?: Error | undefined

  constructor(message: string, code?: ErrorCode, cause?: Error) {
    super()
    this.code = code
    this.message = message
    this.cause = cause
  }
}
export class AppError extends BaseError {}
export class GraphError extends AppError {}

const handleApolloErrors = <T>(errors?: readonly GraphQLError[]) => {
  if (errors) {
    const error = first(errors)
    if (error) {
      throw error
    }
  }
}

export const reportException = (error: Error) => {
  const json = JSON.stringify(error, null, 2)
  console.error(error)
  console.error(json)
  withScope((scope) => {
    scope.setExtra("error-as-json", json)
    captureException(error)
  })
}

const handleGraphError = (error: Error) => {
  // NOTE: sentry all errors except UserError
  if (error instanceof UserError) {
    // no-op
  } else {
    reportException(error)
  }
  return of(Err(error))
}

export const handleUserError = (error: GraphUserError) => {
  const { message, code } = error
  throw new UserError(message, code)
}

export const mutate$ = <InputType, MutationType, ValueType>({
  input,
  mutation,
  getValue,
  refetchQueries,
}: {
  input: InputType
  mutation: TypedDocumentNode<MutationType, Exact<{ input: InputType }>>
  getValue: (data: MutationType) => ValueType
  refetchQueries?: InternalRefetchQueriesInclude
}): Observable<Result<ValueType, Error>> =>
  from(
    client.mutate({
      mutation,
      variables: { input },
      refetchQueries,
    })
  ).pipe(
    map(({ errors, data /* context, extensions */ }) => {
      handleApolloErrors<MutationType>(errors)
      if (!data) throw new GraphError("MIA data")
      return Ok(getValue(data))
    }),
    catchError((error, _caught$) => handleGraphError(error))
  )

export const query$ = <QueryType, QueryVariablesType, ValueType>({
  query,
  variables,
  getValue,
  fetchPolicy = "network-only",
}: {
  query: TypedDocumentNode<QueryType, QueryVariablesType>
  variables: QueryVariablesType
  getValue: (data: QueryType) => ValueType
  fetchPolicy?: FetchPolicy
}): Observable<Result<ValueType, Error>> =>
  from(
    client.query({
      query,
      variables,
      fetchPolicy,
    })
  ).pipe(
    map(({ errors, data /* context, extensions */ }) => {
      handleApolloErrors(errors)
      if (!data) throw new GraphError("MIA data")
      return Ok(getValue(data))
    }),
    catchError((error, _caught$) => handleGraphError(error))
  )

export const watchQuery$ = <QueryType, QueryVariablesType, ValueType>({
  query,
  variables,
  getValue,
  fetchPolicy = "network-only",
}: {
  query: TypedDocumentNode<QueryType, QueryVariablesType>
  variables: QueryVariablesType
  getValue: (data: QueryType) => ValueType
  fetchPolicy?: FetchPolicy
}): Observable<Result<ValueType, Error>> =>
  from(
    zenToRx(
      client.watchQuery({
        query,
        variables,
        fetchPolicy,
      })
    )
  ).pipe(
    map(({ errors, data /* context, extensions */ }) => {
      handleApolloErrors(errors)
      if (!data) throw new GraphError("MIA data")
      return Ok(getValue(data))
    }),
    catchError((error, _caught$) => handleGraphError(error))
  )

export const subscribe$ = <QueryType, QueryVariablesType, ValueType>({
  query,
  variables,
  getValue,
  fetchPolicy = "no-cache",
}: {
  query: TypedDocumentNode<QueryType, QueryVariablesType>
  variables: QueryVariablesType
  getValue: (data: QueryType) => ValueType
  fetchPolicy?: FetchPolicy
}): Observable<Result<ValueType, Error>> =>
  from(
    zenToRx(
      client.subscribe({
        query,
        variables,
        fetchPolicy,
      })
    )
  ).pipe(
    map(({ errors, data /* context, extensions */ }) => {
      handleApolloErrors(errors)
      if (!data) throw new GraphError("MIA data")
      return Ok(getValue(data))
    }),
    catchError((error, _caught$) => handleGraphError(error))
  )
