import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type CreateVerificationInput = {
  e164: Scalars['String'];
};

export type Event = {
  __typename?: 'Event';
  name: EventName;
};

export enum EventName {
  TapSignup = 'TAP_SIGNUP'
}

export type RootMutationType = {
  __typename?: 'RootMutationType';
  createVerification?: Maybe<VerificationResult>;
};


export type RootMutationTypeCreateVerificationArgs = {
  input: CreateVerificationInput;
};

export type RootQueryType = {
  __typename?: 'RootQueryType';
  events: Array<Event>;
};

export type Verification = {
  __typename?: 'Verification';
  status: VerificationStatus;
};

export type VerificationError = {
  __typename?: 'VerificationError';
  message: Scalars['String'];
};

export type VerificationResult = Verification | VerificationError;

export enum VerificationStatus {
  Approved = 'APPROVED',
  Canceled = 'CANCELED',
  Pending = 'PENDING'
}

export type CreateVerificationMutationVariables = Exact<{
  input: CreateVerificationInput;
}>;


export type CreateVerificationMutation = { __typename?: 'RootMutationType', createVerification?: Maybe<{ __typename?: 'Verification', status: VerificationStatus } | { __typename?: 'VerificationError', message: string }> };

export type GetEventsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetEventsQuery = { __typename?: 'RootQueryType', events: Array<{ __typename?: 'Event', name: EventName }> };


export const CreateVerificationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateVerification"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateVerificationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createVerification"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Verification"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VerificationError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}}]} as unknown as DocumentNode<CreateVerificationMutation, CreateVerificationMutationVariables>;
export const GetEventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"events"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<GetEventsQuery, GetEventsQueryVariables>;