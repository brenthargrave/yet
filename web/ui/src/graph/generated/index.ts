import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
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

export type Customer = {
  __typename?: 'Customer';
  e164: Scalars['String'];
  id: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  org?: Maybe<Scalars['String']>;
  role?: Maybe<Scalars['String']>;
  token: Scalars['String'];
};

export type Event = {
  __typename?: 'Event';
  anonId: Scalars['String'];
  name: EventName;
};

export enum EventName {
  TapSignin = 'TAP_SIGNIN',
  TapSignup = 'TAP_SIGNUP'
}

export type EventProperties = {
  tmp?: InputMaybe<Scalars['String']>;
};

export type ProfileInput = {
  id: Scalars['String'];
  name?: InputMaybe<Scalars['String']>;
  org?: InputMaybe<Scalars['String']>;
  role?: InputMaybe<Scalars['String']>;
};

export type ProfilePayload = {
  __typename?: 'ProfilePayload';
  me: Customer;
};

export type RootMutationType = {
  __typename?: 'RootMutationType';
  submitCode?: Maybe<SubmitCodeResult>;
  submitPhone?: Maybe<SubmitPhoneResult>;
  trackEvent?: Maybe<Event>;
  updateProfile?: Maybe<UpdateProfileResult>;
};


export type RootMutationTypeSubmitCodeArgs = {
  input: SubmitCodeInput;
};


export type RootMutationTypeSubmitPhoneArgs = {
  input: SubmitPhoneInput;
};


export type RootMutationTypeTrackEventArgs = {
  input: TrackEventInput;
};


export type RootMutationTypeUpdateProfileArgs = {
  input: ProfileInput;
};

export type RootQueryType = {
  __typename?: 'RootQueryType';
  events: Array<Event>;
  me?: Maybe<Customer>;
};

export type SubmitCodeInput = {
  code: Scalars['String'];
  e164: Scalars['String'];
};

export type SubmitCodePayload = {
  __typename?: 'SubmitCodePayload';
  me: Customer;
  verification: Verification;
};

export type SubmitCodeResult = SubmitCodePayload | UserError;

export type SubmitPhoneInput = {
  e164: Scalars['String'];
};

export type SubmitPhoneResult = UserError | Verification;

export type TrackEventInput = {
  anonId: Scalars['String'];
  name: EventName;
  properties: EventProperties;
  userId?: InputMaybe<Scalars['String']>;
};

export type UpdateProfileResult = ProfilePayload | UserError;

export type UserError = {
  __typename?: 'UserError';
  message: Scalars['String'];
};

export type Verification = {
  __typename?: 'Verification';
  status: VerificationStatus;
};

export enum VerificationStatus {
  Approved = 'APPROVED',
  Canceled = 'CANCELED',
  Pending = 'PENDING'
}

export type UpdateProfileMutationVariables = Exact<{
  input: ProfileInput;
}>;


export type UpdateProfileMutation = { __typename?: 'RootMutationType', updateProfile?: { __typename?: 'ProfilePayload', me: { __typename?: 'Customer', id: string, name?: string | null, org?: string | null, role?: string | null } } | { __typename?: 'UserError', message: string } | null };

export type SubmitPhoneMutationVariables = Exact<{
  input: SubmitPhoneInput;
}>;


export type SubmitPhoneMutation = { __typename?: 'RootMutationType', submitPhone?: { __typename?: 'UserError', message: string } | { __typename?: 'Verification', status: VerificationStatus } | null };

export type SubmitCodeMutationVariables = Exact<{
  input: SubmitCodeInput;
}>;


export type SubmitCodeMutation = { __typename?: 'RootMutationType', submitCode?: { __typename?: 'SubmitCodePayload', me: { __typename?: 'Customer', id: string, token: string, e164: string }, verification: { __typename?: 'Verification', status: VerificationStatus } } | { __typename?: 'UserError', message: string } | null };

export type TrackEventMutationVariables = Exact<{
  input: TrackEventInput;
}>;


export type TrackEventMutation = { __typename?: 'RootMutationType', trackEvent?: { __typename?: 'Event', name: EventName, anonId: string } | null };

export type GetEventsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetEventsQuery = { __typename?: 'RootQueryType', events: Array<{ __typename?: 'Event', name: EventName, anonId: string }> };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'RootQueryType', me?: { __typename?: 'Customer', id: string, token: string, e164: string } | null };


export const UpdateProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProfilePayload"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"org"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateProfileMutation, UpdateProfileMutationVariables>;
export const SubmitPhoneDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SubmitPhone"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SubmitPhoneInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitPhone"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Verification"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}}]} as unknown as DocumentNode<SubmitPhoneMutation, SubmitPhoneMutationVariables>;
export const SubmitCodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SubmitCode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SubmitCodeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitCode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubmitCodePayload"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"e164"}}]}},{"kind":"Field","name":{"kind":"Name","value":"verification"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}}]} as unknown as DocumentNode<SubmitCodeMutation, SubmitCodeMutationVariables>;
export const TrackEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TrackEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TrackEventInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"anonId"}}]}}]}}]} as unknown as DocumentNode<TrackEventMutation, TrackEventMutationVariables>;
export const GetEventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"events"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"anonId"}}]}}]}}]} as unknown as DocumentNode<GetEventsQuery, GetEventsQueryVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"e164"}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;