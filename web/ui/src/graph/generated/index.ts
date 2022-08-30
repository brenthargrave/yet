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
  /**
   * The `DateTime` scalar type represents a date and time in the UTC
   * timezone. The DateTime appears in a JSON response as an ISO8601 formatted
   * string, including UTC timezone ("Z"). The parsed date and time string will
   * be converted to UTC if there is an offset.
   */
  DateTime: any;
};

export type Contact = {
  __typename?: 'Contact';
  id: Scalars['ID'];
  name: Scalars['String'];
  org: Scalars['String'];
  role: Scalars['String'];
};

export type ContactProfileChanged = {
  __typename?: 'ContactProfileChanged';
  contact: Contact;
  occurredAt: Scalars['DateTime'];
  type: TimelineEventType;
};

export type Conversation = {
  __typename?: 'Conversation';
  creator: Contact;
  deletedAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  invitees: Array<Invitee>;
  note?: Maybe<Scalars['String']>;
  occurredAt: Scalars['DateTime'];
  opps: Array<Opp>;
  reviews: Array<Review>;
  signatures: Array<Signature>;
  status: ConversationStatus;
};

export type ConversationChangedInput = {
  id: Scalars['ID'];
};

export type ConversationInput = {
  id: Scalars['String'];
  invitees: Array<InviteeInput>;
  mentions: Array<MentionInput>;
  note?: InputMaybe<Scalars['String']>;
  occurredAt: Scalars['DateTime'];
  status?: InputMaybe<ConversationStatus>;
};

export type ConversationPayload = {
  __typename?: 'ConversationPayload';
  conversation?: Maybe<Conversation>;
  userError?: Maybe<UserError>;
};

export type ConversationPublished = {
  __typename?: 'ConversationPublished';
  conversation: Conversation;
  occurredAt: Scalars['DateTime'];
  type: TimelineEventType;
};

export enum ConversationStatus {
  Deleted = 'DELETED',
  Draft = 'DRAFT',
  Proposed = 'PROPOSED',
  Signed = 'SIGNED'
}

export type ConversationsPayload = {
  __typename?: 'ConversationsPayload';
  conversations: Array<Conversation>;
};

export enum Currency {
  Usd = 'USD'
}

export type Customer = {
  __typename?: 'Customer';
  e164: Scalars['String'];
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  org?: Maybe<Scalars['String']>;
  role?: Maybe<Scalars['String']>;
  token: Scalars['String'];
};

export type DeleteConversationInput = {
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  id: Scalars['String'];
};

export enum ErrorCode {
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type Event = {
  __typename?: 'Event';
  anonId: Scalars['String'];
  name: EventName;
};

export enum EventName {
  ReviewedConversation = 'REVIEWED_CONVERSATION',
  TapNewConversation = 'TAP_NEW_CONVERSATION',
  TapPropose = 'TAP_PROPOSE',
  TapSignin = 'TAP_SIGNIN',
  TapSignup = 'TAP_SIGNUP'
}

export type EventProperties = {
  conversation?: InputMaybe<Scalars['ID']>;
};

export type GetProfileInput = {
  id: Scalars['ID'];
};

export type Invitee = {
  __typename?: 'Invitee';
  id: Scalars['ID'];
  isContact: Scalars['Boolean'];
  name: Scalars['String'];
};

export type InviteeInput = {
  id: Scalars['String'];
  isContact: Scalars['Boolean'];
  name: Scalars['String'];
};

export type MentionInput = {
  id: Scalars['ID'];
  oppId: Scalars['ID'];
};

export type Money = {
  __typename?: 'Money';
  amount: Scalars['Int'];
  currency: Currency;
};

export type MoneyInput = {
  amount: Scalars['Int'];
  currency: Currency;
};

export type Opp = {
  __typename?: 'Opp';
  creator: Contact;
  desc?: Maybe<Scalars['String']>;
  fee: Money;
  id: Scalars['ID'];
  insertedAt: Scalars['DateTime'];
  org: Scalars['String'];
  owner: Contact;
  role: Scalars['String'];
  url?: Maybe<Scalars['String']>;
};

export type OppInput = {
  desc?: InputMaybe<Scalars['String']>;
  fee: MoneyInput;
  id: Scalars['String'];
  org: Scalars['String'];
  role: Scalars['String'];
  url?: InputMaybe<Scalars['String']>;
};

export type OppPayload = {
  __typename?: 'OppPayload';
  opp?: Maybe<Opp>;
  userError?: Maybe<UserError>;
};

export type OppsPayload = {
  __typename?: 'OppsPayload';
  opps: Array<Opp>;
};

export type Profile = {
  __typename?: 'Profile';
  contact: Contact;
  events: Array<TimelineEvent>;
};

export type ProfileInput = {
  id: Scalars['String'];
  prop: ProfileProp;
  value: Scalars['String'];
};

export type ProfilePayload = {
  __typename?: 'ProfilePayload';
  profile: Profile;
};

export enum ProfileProp {
  Name = 'NAME',
  Org = 'ORG',
  Role = 'ROLE'
}

export type ProposeInput = {
  id: Scalars['ID'];
  proposedAt?: InputMaybe<Scalars['DateTime']>;
};

export type Review = {
  __typename?: 'Review';
  conversationId: Scalars['ID'];
  id: Scalars['ID'];
  insertedAt: Scalars['DateTime'];
  reviewer: Contact;
};

export type ReviewInput = {
  id: Scalars['ID'];
};

export type RootMutationType = {
  __typename?: 'RootMutationType';
  deleteConversation?: Maybe<ConversationPayload>;
  propose?: Maybe<ConversationPayload>;
  review?: Maybe<ConversationPayload>;
  sign?: Maybe<ConversationPayload>;
  submitCode?: Maybe<SubmitCodeResult>;
  submitPhone?: Maybe<SubmitPhoneResult>;
  trackEvent?: Maybe<Event>;
  updateProfile?: Maybe<UpdateProfilePayload>;
  upsertConversation?: Maybe<ConversationPayload>;
  upsertOpp?: Maybe<OppPayload>;
};


export type RootMutationTypeDeleteConversationArgs = {
  input: DeleteConversationInput;
};


export type RootMutationTypeProposeArgs = {
  input: ProposeInput;
};


export type RootMutationTypeReviewArgs = {
  input: ReviewInput;
};


export type RootMutationTypeSignArgs = {
  input: SignInput;
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


export type RootMutationTypeUpsertConversationArgs = {
  input: ConversationInput;
};


export type RootMutationTypeUpsertOppArgs = {
  input: OppInput;
};

export type RootQueryType = {
  __typename?: 'RootQueryType';
  checkToken?: Maybe<TokenPayload>;
  contacts: Array<Contact>;
  events: Array<Event>;
  getConversation?: Maybe<ConversationPayload>;
  getConversations?: Maybe<ConversationsPayload>;
  getOpp?: Maybe<OppPayload>;
  getOpps?: Maybe<OppsPayload>;
  getProfile?: Maybe<ProfilePayload>;
  getTimeline?: Maybe<TimelinePayload>;
  me?: Maybe<Customer>;
};


export type RootQueryTypeGetConversationArgs = {
  id: Scalars['ID'];
};


export type RootQueryTypeGetOppArgs = {
  id: Scalars['ID'];
};


export type RootQueryTypeGetProfileArgs = {
  input?: InputMaybe<GetProfileInput>;
};


export type RootQueryTypeGetTimelineArgs = {
  input?: InputMaybe<TimelineInput>;
};

export type RootSubscriptionType = {
  __typename?: 'RootSubscriptionType';
  conversationChanged?: Maybe<Conversation>;
  timelineEventsAdded?: Maybe<TimelinePayload>;
};


export type RootSubscriptionTypeConversationChangedArgs = {
  input: ConversationChangedInput;
};


export type RootSubscriptionTypeTimelineEventsAddedArgs = {
  input: TimelineEventsAddedInput;
};

export type SignInput = {
  conversationUrl: Scalars['String'];
  id: Scalars['ID'];
  signedAt?: InputMaybe<Scalars['DateTime']>;
};

export type Signature = {
  __typename?: 'Signature';
  conversationId: Scalars['ID'];
  id: Scalars['ID'];
  signedAt: Scalars['DateTime'];
  signer: Contact;
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

export type TimelineEvent = ContactProfileChanged | ConversationPublished;

export enum TimelineEventType {
  ContactProfileChanged = 'CONTACT_PROFILE_CHANGED',
  ConversationPublished = 'CONVERSATION_PUBLISHED'
}

export type TimelineEventsAddedInput = {
  id: Scalars['ID'];
};

export type TimelineFilters = {
  opps?: InputMaybe<Array<Scalars['ID']>>;
};

export type TimelineInput = {
  filters?: InputMaybe<TimelineFilters>;
};

export type TimelinePayload = {
  __typename?: 'TimelinePayload';
  events: Array<TimelineEvent>;
};

export type Token = {
  __typename?: 'Token';
  value?: Maybe<Scalars['String']>;
};

export type TokenPayload = {
  __typename?: 'TokenPayload';
  token?: Maybe<Token>;
};

export type TrackEventInput = {
  anonId: Scalars['String'];
  name: EventName;
  properties: EventProperties;
  userId?: InputMaybe<Scalars['String']>;
};

export type UpdateProfilePayload = {
  __typename?: 'UpdateProfilePayload';
  me?: Maybe<Customer>;
  userError?: Maybe<UserError>;
};

export type UserError = {
  __typename?: 'UserError';
  code?: Maybe<ErrorCode>;
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

export type TrackEventMutationVariables = Exact<{
  input: TrackEventInput;
}>;


export type TrackEventMutation = { __typename?: 'RootMutationType', trackEvent?: { __typename?: 'Event', name: EventName, anonId: string } | null };

export type GetEventsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetEventsQuery = { __typename?: 'RootQueryType', events: Array<{ __typename?: 'Event', name: EventName, anonId: string }> };

export type CheckTokenQueryVariables = Exact<{ [key: string]: never; }>;


export type CheckTokenQuery = { __typename?: 'RootQueryType', checkToken?: { __typename?: 'TokenPayload', token?: { __typename?: 'Token', value?: string | null } | null } | null };

export type AuthenticatedCustomerPropsFragment = { __typename?: 'Customer', id: string, token: string, e164: string, name?: string | null, org?: string | null, role?: string | null };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'RootQueryType', me?: { __typename?: 'Customer', id: string, token: string, e164: string, name?: string | null, org?: string | null, role?: string | null } | null };

export type SubmitPhoneMutationVariables = Exact<{
  input: SubmitPhoneInput;
}>;


export type SubmitPhoneMutation = { __typename?: 'RootMutationType', submitPhone?: { __typename?: 'UserError', message: string } | { __typename?: 'Verification', status: VerificationStatus } | null };

export type SubmitCodeMutationVariables = Exact<{
  input: SubmitCodeInput;
}>;


export type SubmitCodeMutation = { __typename?: 'RootMutationType', submitCode?: { __typename?: 'SubmitCodePayload', me: { __typename?: 'Customer', id: string, token: string, e164: string, name?: string | null, org?: string | null, role?: string | null }, verification: { __typename?: 'Verification', status: VerificationStatus } } | { __typename?: 'UserError', message: string } | null };

export type UpdateProfileMutationVariables = Exact<{
  input: ProfileInput;
}>;


export type UpdateProfileMutation = { __typename?: 'RootMutationType', updateProfile?: { __typename?: 'UpdateProfilePayload', me?: { __typename?: 'Customer', id: string, name?: string | null, org?: string | null, role?: string | null } | null, userError?: { __typename?: 'UserError', message: string } | null } | null };

export type ContactPropsFragment = { __typename?: 'Contact', id: string, name: string, org: string, role: string };

export type BaseConversationPropsFragment = { __typename?: 'Conversation', id: string, note?: string | null, status: ConversationStatus, insertedAt?: any | null, occurredAt: any, deletedAt?: any | null, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, invitees: Array<{ __typename?: 'Invitee', id: string, name: string, isContact: boolean }>, signatures: Array<{ __typename?: 'Signature', id: string, signedAt: any, conversationId: string, signer: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }> };

export type ConversationPropsFragment = { __typename?: 'Conversation', id: string, note?: string | null, status: ConversationStatus, insertedAt?: any | null, occurredAt: any, deletedAt?: any | null, reviews: Array<{ __typename?: 'Review', id: string, conversationId: string, insertedAt: any, reviewer: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }>, opps: Array<{ __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, owner: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }>, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, invitees: Array<{ __typename?: 'Invitee', id: string, name: string, isContact: boolean }>, signatures: Array<{ __typename?: 'Signature', id: string, signedAt: any, conversationId: string, signer: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }> };

export type UserErrorPropsFragment = { __typename?: 'UserError', code?: ErrorCode | null, message: string };

export type ConversationPayloadPropsFragment = { __typename?: 'ConversationPayload', conversation?: { __typename?: 'Conversation', id: string, note?: string | null, status: ConversationStatus, insertedAt?: any | null, occurredAt: any, deletedAt?: any | null, reviews: Array<{ __typename?: 'Review', id: string, conversationId: string, insertedAt: any, reviewer: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }>, opps: Array<{ __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, owner: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }>, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, invitees: Array<{ __typename?: 'Invitee', id: string, name: string, isContact: boolean }>, signatures: Array<{ __typename?: 'Signature', id: string, signedAt: any, conversationId: string, signer: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }> } | null, userError?: { __typename?: 'UserError', code?: ErrorCode | null, message: string } | null };

export type GetConversationsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetConversationsQuery = { __typename?: 'RootQueryType', getConversations?: { __typename?: 'ConversationsPayload', conversations: Array<{ __typename?: 'Conversation', id: string, note?: string | null, status: ConversationStatus, insertedAt?: any | null, occurredAt: any, deletedAt?: any | null, reviews: Array<{ __typename?: 'Review', id: string, conversationId: string, insertedAt: any, reviewer: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }>, opps: Array<{ __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, owner: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }>, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, invitees: Array<{ __typename?: 'Invitee', id: string, name: string, isContact: boolean }>, signatures: Array<{ __typename?: 'Signature', id: string, signedAt: any, conversationId: string, signer: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }> }> } | null };

export type ViewConversationQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type ViewConversationQuery = { __typename?: 'RootQueryType', getConversation?: { __typename?: 'ConversationPayload', conversation?: { __typename?: 'Conversation', id: string, note?: string | null, status: ConversationStatus, insertedAt?: any | null, occurredAt: any, deletedAt?: any | null, reviews: Array<{ __typename?: 'Review', id: string, conversationId: string, insertedAt: any, reviewer: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }>, opps: Array<{ __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, owner: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }>, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, invitees: Array<{ __typename?: 'Invitee', id: string, name: string, isContact: boolean }>, signatures: Array<{ __typename?: 'Signature', id: string, signedAt: any, conversationId: string, signer: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }> } | null, userError?: { __typename?: 'UserError', code?: ErrorCode | null, message: string } | null } | null };

export type UpsertConversationMutationVariables = Exact<{
  input: ConversationInput;
}>;


export type UpsertConversationMutation = { __typename?: 'RootMutationType', upsertConversation?: { __typename?: 'ConversationPayload', conversation?: { __typename?: 'Conversation', id: string, note?: string | null, status: ConversationStatus, insertedAt?: any | null, occurredAt: any, deletedAt?: any | null, reviews: Array<{ __typename?: 'Review', id: string, conversationId: string, insertedAt: any, reviewer: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }>, opps: Array<{ __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, owner: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }>, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, invitees: Array<{ __typename?: 'Invitee', id: string, name: string, isContact: boolean }>, signatures: Array<{ __typename?: 'Signature', id: string, signedAt: any, conversationId: string, signer: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }> } | null, userError?: { __typename?: 'UserError', code?: ErrorCode | null, message: string } | null } | null };

export type DeleteConversationMutationVariables = Exact<{
  input: DeleteConversationInput;
}>;


export type DeleteConversationMutation = { __typename?: 'RootMutationType', deleteConversation?: { __typename?: 'ConversationPayload', conversation?: { __typename?: 'Conversation', id: string, note?: string | null, status: ConversationStatus, insertedAt?: any | null, occurredAt: any, deletedAt?: any | null, reviews: Array<{ __typename?: 'Review', id: string, conversationId: string, insertedAt: any, reviewer: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }>, opps: Array<{ __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, owner: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }>, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, invitees: Array<{ __typename?: 'Invitee', id: string, name: string, isContact: boolean }>, signatures: Array<{ __typename?: 'Signature', id: string, signedAt: any, conversationId: string, signer: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }> } | null, userError?: { __typename?: 'UserError', code?: ErrorCode | null, message: string } | null } | null };

export type SignConversationMutationVariables = Exact<{
  input: SignInput;
}>;


export type SignConversationMutation = { __typename?: 'RootMutationType', sign?: { __typename?: 'ConversationPayload', conversation?: { __typename?: 'Conversation', id: string, note?: string | null, status: ConversationStatus, insertedAt?: any | null, occurredAt: any, deletedAt?: any | null, reviews: Array<{ __typename?: 'Review', id: string, conversationId: string, insertedAt: any, reviewer: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }>, opps: Array<{ __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, owner: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }>, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, invitees: Array<{ __typename?: 'Invitee', id: string, name: string, isContact: boolean }>, signatures: Array<{ __typename?: 'Signature', id: string, signedAt: any, conversationId: string, signer: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }> } | null, userError?: { __typename?: 'UserError', code?: ErrorCode | null, message: string } | null } | null };

export type ProposeConversationMutationVariables = Exact<{
  input: ProposeInput;
}>;


export type ProposeConversationMutation = { __typename?: 'RootMutationType', propose?: { __typename?: 'ConversationPayload', conversation?: { __typename?: 'Conversation', id: string, note?: string | null, status: ConversationStatus, insertedAt?: any | null, occurredAt: any, deletedAt?: any | null, reviews: Array<{ __typename?: 'Review', id: string, conversationId: string, insertedAt: any, reviewer: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }>, opps: Array<{ __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, owner: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }>, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, invitees: Array<{ __typename?: 'Invitee', id: string, name: string, isContact: boolean }>, signatures: Array<{ __typename?: 'Signature', id: string, signedAt: any, conversationId: string, signer: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }> } | null, userError?: { __typename?: 'UserError', code?: ErrorCode | null, message: string } | null } | null };

export type ReviewConversationMutationVariables = Exact<{
  input: ReviewInput;
}>;


export type ReviewConversationMutation = { __typename?: 'RootMutationType', review?: { __typename?: 'ConversationPayload', conversation?: { __typename?: 'Conversation', id: string, note?: string | null, status: ConversationStatus, insertedAt?: any | null, occurredAt: any, deletedAt?: any | null, reviews: Array<{ __typename?: 'Review', id: string, conversationId: string, insertedAt: any, reviewer: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }>, opps: Array<{ __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, owner: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }>, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, invitees: Array<{ __typename?: 'Invitee', id: string, name: string, isContact: boolean }>, signatures: Array<{ __typename?: 'Signature', id: string, signedAt: any, conversationId: string, signer: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }> } | null, userError?: { __typename?: 'UserError', code?: ErrorCode | null, message: string } | null } | null };

export type ContactsQueryVariables = Exact<{ [key: string]: never; }>;


export type ContactsQuery = { __typename?: 'RootQueryType', contacts: Array<{ __typename?: 'Contact', id: string, name: string, org: string, role: string }> };

export type ConversationChangedSubscriptionVariables = Exact<{
  input: ConversationChangedInput;
}>;


export type ConversationChangedSubscription = { __typename?: 'RootSubscriptionType', conversationChanged?: { __typename?: 'Conversation', id: string, note?: string | null, status: ConversationStatus, insertedAt?: any | null, occurredAt: any, deletedAt?: any | null, reviews: Array<{ __typename?: 'Review', id: string, conversationId: string, insertedAt: any, reviewer: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }>, opps: Array<{ __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, owner: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }>, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, invitees: Array<{ __typename?: 'Invitee', id: string, name: string, isContact: boolean }>, signatures: Array<{ __typename?: 'Signature', id: string, signedAt: any, conversationId: string, signer: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }> } | null };

export type OppPropsFragment = { __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, owner: { __typename?: 'Contact', id: string, name: string, org: string, role: string } };

export type OppPayloadPropsFragment = { __typename?: 'OppPayload', opp?: { __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, owner: { __typename?: 'Contact', id: string, name: string, org: string, role: string } } | null, userError?: { __typename?: 'UserError', code?: ErrorCode | null, message: string } | null };

export type GetOppsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetOppsQuery = { __typename?: 'RootQueryType', getOpps?: { __typename?: 'OppsPayload', opps: Array<{ __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, owner: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }> } | null };

export type UpsertOppMutationVariables = Exact<{
  input: OppInput;
}>;


export type UpsertOppMutation = { __typename?: 'RootMutationType', upsertOpp?: { __typename?: 'OppPayload', opp?: { __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, owner: { __typename?: 'Contact', id: string, name: string, org: string, role: string } } | null, userError?: { __typename?: 'UserError', code?: ErrorCode | null, message: string } | null } | null };

export type GetOppQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type GetOppQuery = { __typename?: 'RootQueryType', getOpp?: { __typename?: 'OppPayload', opp?: { __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, owner: { __typename?: 'Contact', id: string, name: string, org: string, role: string } } | null, userError?: { __typename?: 'UserError', code?: ErrorCode | null, message: string } | null } | null };

export type GetProfileQueryVariables = Exact<{
  input?: InputMaybe<GetProfileInput>;
}>;


export type GetProfileQuery = { __typename?: 'RootQueryType', getProfile?: { __typename?: 'ProfilePayload', profile: { __typename?: 'Profile', contact: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, events: Array<{ __typename?: 'ContactProfileChanged', type: TimelineEventType, occurredAt: any, contact: { __typename?: 'Contact', id: string, name: string, org: string, role: string } } | { __typename?: 'ConversationPublished', type: TimelineEventType, occurredAt: any, conversation: { __typename?: 'Conversation', id: string, note?: string | null, status: ConversationStatus, insertedAt?: any | null, occurredAt: any, deletedAt?: any | null, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, reviews: Array<{ __typename?: 'Review', id: string, conversationId: string, insertedAt: any, reviewer: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }>, opps: Array<{ __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, owner: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }>, invitees: Array<{ __typename?: 'Invitee', id: string, name: string, isContact: boolean }>, signatures: Array<{ __typename?: 'Signature', id: string, signedAt: any, conversationId: string, signer: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }> } }> } } | null };

type TimelineEventProps_ContactProfileChanged_Fragment = { __typename?: 'ContactProfileChanged', type: TimelineEventType, occurredAt: any, contact: { __typename?: 'Contact', id: string, name: string, org: string, role: string } };

type TimelineEventProps_ConversationPublished_Fragment = { __typename?: 'ConversationPublished', type: TimelineEventType, occurredAt: any, conversation: { __typename?: 'Conversation', id: string, note?: string | null, status: ConversationStatus, insertedAt?: any | null, occurredAt: any, deletedAt?: any | null, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, reviews: Array<{ __typename?: 'Review', id: string, conversationId: string, insertedAt: any, reviewer: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }>, opps: Array<{ __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, owner: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }>, invitees: Array<{ __typename?: 'Invitee', id: string, name: string, isContact: boolean }>, signatures: Array<{ __typename?: 'Signature', id: string, signedAt: any, conversationId: string, signer: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }> } };

export type TimelineEventPropsFragment = TimelineEventProps_ContactProfileChanged_Fragment | TimelineEventProps_ConversationPublished_Fragment;

export type TimelinePayloadPropsFragment = { __typename?: 'TimelinePayload', events: Array<{ __typename?: 'ContactProfileChanged', type: TimelineEventType, occurredAt: any, contact: { __typename?: 'Contact', id: string, name: string, org: string, role: string } } | { __typename?: 'ConversationPublished', type: TimelineEventType, occurredAt: any, conversation: { __typename?: 'Conversation', id: string, note?: string | null, status: ConversationStatus, insertedAt?: any | null, occurredAt: any, deletedAt?: any | null, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, reviews: Array<{ __typename?: 'Review', id: string, conversationId: string, insertedAt: any, reviewer: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }>, opps: Array<{ __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, owner: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }>, invitees: Array<{ __typename?: 'Invitee', id: string, name: string, isContact: boolean }>, signatures: Array<{ __typename?: 'Signature', id: string, signedAt: any, conversationId: string, signer: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }> } }> };

export type GetTimelineQueryVariables = Exact<{
  input?: InputMaybe<TimelineInput>;
}>;


export type GetTimelineQuery = { __typename?: 'RootQueryType', getTimeline?: { __typename?: 'TimelinePayload', events: Array<{ __typename?: 'ContactProfileChanged', type: TimelineEventType, occurredAt: any, contact: { __typename?: 'Contact', id: string, name: string, org: string, role: string } } | { __typename?: 'ConversationPublished', type: TimelineEventType, occurredAt: any, conversation: { __typename?: 'Conversation', id: string, note?: string | null, status: ConversationStatus, insertedAt?: any | null, occurredAt: any, deletedAt?: any | null, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, reviews: Array<{ __typename?: 'Review', id: string, conversationId: string, insertedAt: any, reviewer: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }>, opps: Array<{ __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, owner: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }>, invitees: Array<{ __typename?: 'Invitee', id: string, name: string, isContact: boolean }>, signatures: Array<{ __typename?: 'Signature', id: string, signedAt: any, conversationId: string, signer: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }> } }> } | null };

export type TimelineEventsAddedSubscriptionVariables = Exact<{
  input: TimelineEventsAddedInput;
}>;


export type TimelineEventsAddedSubscription = { __typename?: 'RootSubscriptionType', timelineEventsAdded?: { __typename?: 'TimelinePayload', events: Array<{ __typename?: 'ContactProfileChanged', type: TimelineEventType, occurredAt: any, contact: { __typename?: 'Contact', id: string, name: string, org: string, role: string } } | { __typename?: 'ConversationPublished', type: TimelineEventType, occurredAt: any, conversation: { __typename?: 'Conversation', id: string, note?: string | null, status: ConversationStatus, insertedAt?: any | null, occurredAt: any, deletedAt?: any | null, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, reviews: Array<{ __typename?: 'Review', id: string, conversationId: string, insertedAt: any, reviewer: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }>, opps: Array<{ __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Contact', id: string, name: string, org: string, role: string }, owner: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }>, invitees: Array<{ __typename?: 'Invitee', id: string, name: string, isContact: boolean }>, signatures: Array<{ __typename?: 'Signature', id: string, signedAt: any, conversationId: string, signer: { __typename?: 'Contact', id: string, name: string, org: string, role: string } }> } }> } | null };

export const AuthenticatedCustomerPropsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AuthenticatedCustomerProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Customer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"e164"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"org"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]} as unknown as DocumentNode<AuthenticatedCustomerPropsFragment, unknown>;
export const ContactPropsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ContactProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Contact"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"org"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]} as unknown as DocumentNode<ContactPropsFragment, unknown>;
export const BaseConversationPropsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BaseConversationProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Conversation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"creator"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ContactProps"}}]}},{"kind":"Field","name":{"kind":"Name","value":"invitees"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isContact"}}]}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"insertedAt"}},{"kind":"Field","name":{"kind":"Name","value":"occurredAt"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"signatures"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"signedAt"}},{"kind":"Field","name":{"kind":"Name","value":"conversationId"}},{"kind":"Field","name":{"kind":"Name","value":"signer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ContactProps"}}]}}]}}]}},...ContactPropsFragmentDoc.definitions]} as unknown as DocumentNode<BaseConversationPropsFragment, unknown>;
export const OppPropsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OppProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Opp"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"org"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"desc"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"fee"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"creator"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ContactProps"}}]}},{"kind":"Field","name":{"kind":"Name","value":"owner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ContactProps"}}]}},{"kind":"Field","name":{"kind":"Name","value":"insertedAt"}}]}},...ContactPropsFragmentDoc.definitions]} as unknown as DocumentNode<OppPropsFragment, unknown>;
export const ConversationPropsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ConversationProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Conversation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"BaseConversationProps"}},{"kind":"Field","name":{"kind":"Name","value":"reviews"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"conversationId"}},{"kind":"Field","name":{"kind":"Name","value":"insertedAt"}},{"kind":"Field","name":{"kind":"Name","value":"reviewer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ContactProps"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"opps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OppProps"}}]}}]}},...BaseConversationPropsFragmentDoc.definitions,...ContactPropsFragmentDoc.definitions,...OppPropsFragmentDoc.definitions]} as unknown as DocumentNode<ConversationPropsFragment, unknown>;
export const UserErrorPropsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserErrorProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]} as unknown as DocumentNode<UserErrorPropsFragment, unknown>;
export const ConversationPayloadPropsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ConversationPayloadProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ConversationPayload"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"conversation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ConversationProps"}}]}},{"kind":"Field","name":{"kind":"Name","value":"userError"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserErrorProps"}}]}}]}},...ConversationPropsFragmentDoc.definitions,...UserErrorPropsFragmentDoc.definitions]} as unknown as DocumentNode<ConversationPayloadPropsFragment, unknown>;
export const OppPayloadPropsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OppPayloadProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OppPayload"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"opp"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OppProps"}}]}},{"kind":"Field","name":{"kind":"Name","value":"userError"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserErrorProps"}}]}}]}},...OppPropsFragmentDoc.definitions,...UserErrorPropsFragmentDoc.definitions]} as unknown as DocumentNode<OppPayloadPropsFragment, unknown>;
export const TimelineEventPropsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TimelineEventProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TimelineEvent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ConversationPublished"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"occurredAt"}},{"kind":"Field","name":{"kind":"Name","value":"conversation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ConversationProps"}},{"kind":"Field","name":{"kind":"Name","value":"creator"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"org"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ContactProfileChanged"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"occurredAt"}},{"kind":"Field","name":{"kind":"Name","value":"contact"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ContactProps"}}]}}]}}]}},...ConversationPropsFragmentDoc.definitions,...ContactPropsFragmentDoc.definitions]} as unknown as DocumentNode<TimelineEventPropsFragment, unknown>;
export const TimelinePayloadPropsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TimelinePayloadProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TimelinePayload"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"events"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TimelineEventProps"}}]}}]}},...TimelineEventPropsFragmentDoc.definitions]} as unknown as DocumentNode<TimelinePayloadPropsFragment, unknown>;
export const TrackEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TrackEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TrackEventInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"anonId"}}]}}]}}]} as unknown as DocumentNode<TrackEventMutation, TrackEventMutationVariables>;
export const GetEventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"events"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"anonId"}}]}}]}}]} as unknown as DocumentNode<GetEventsQuery, GetEventsQueryVariables>;
export const CheckTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CheckToken"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkToken"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]} as unknown as DocumentNode<CheckTokenQuery, CheckTokenQueryVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AuthenticatedCustomerProps"}}]}}]}},...AuthenticatedCustomerPropsFragmentDoc.definitions]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const SubmitPhoneDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SubmitPhone"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SubmitPhoneInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitPhone"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Verification"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}}]} as unknown as DocumentNode<SubmitPhoneMutation, SubmitPhoneMutationVariables>;
export const SubmitCodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SubmitCode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SubmitCodeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitCode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubmitCodePayload"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AuthenticatedCustomerProps"}}]}},{"kind":"Field","name":{"kind":"Name","value":"verification"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}},...AuthenticatedCustomerPropsFragmentDoc.definitions]} as unknown as DocumentNode<SubmitCodeMutation, SubmitCodeMutationVariables>;
export const UpdateProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"org"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}},{"kind":"Field","name":{"kind":"Name","value":"userError"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateProfileMutation, UpdateProfileMutationVariables>;
export const GetConversationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetConversations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getConversations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"conversations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ConversationProps"}}]}}]}}]}},...ConversationPropsFragmentDoc.definitions]} as unknown as DocumentNode<GetConversationsQuery, GetConversationsQueryVariables>;
export const ViewConversationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ViewConversation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getConversation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ConversationPayloadProps"}}]}}]}},...ConversationPayloadPropsFragmentDoc.definitions]} as unknown as DocumentNode<ViewConversationQuery, ViewConversationQueryVariables>;
export const UpsertConversationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertConversation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ConversationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertConversation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ConversationPayloadProps"}}]}}]}},...ConversationPayloadPropsFragmentDoc.definitions]} as unknown as DocumentNode<UpsertConversationMutation, UpsertConversationMutationVariables>;
export const DeleteConversationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteConversation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteConversationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteConversation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ConversationPayloadProps"}}]}}]}},...ConversationPayloadPropsFragmentDoc.definitions]} as unknown as DocumentNode<DeleteConversationMutation, DeleteConversationMutationVariables>;
export const SignConversationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SignConversation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SignInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sign"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ConversationPayloadProps"}}]}}]}},...ConversationPayloadPropsFragmentDoc.definitions]} as unknown as DocumentNode<SignConversationMutation, SignConversationMutationVariables>;
export const ProposeConversationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ProposeConversation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProposeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"propose"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ConversationPayloadProps"}}]}}]}},...ConversationPayloadPropsFragmentDoc.definitions]} as unknown as DocumentNode<ProposeConversationMutation, ProposeConversationMutationVariables>;
export const ReviewConversationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ReviewConversation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ReviewInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"review"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ConversationPayloadProps"}}]}}]}},...ConversationPayloadPropsFragmentDoc.definitions]} as unknown as DocumentNode<ReviewConversationMutation, ReviewConversationMutationVariables>;
export const ContactsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Contacts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"contacts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ContactProps"}}]}}]}},...ContactPropsFragmentDoc.definitions]} as unknown as DocumentNode<ContactsQuery, ContactsQueryVariables>;
export const ConversationChangedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"ConversationChanged"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ConversationChangedInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"conversationChanged"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ConversationProps"}}]}}]}},...ConversationPropsFragmentDoc.definitions]} as unknown as DocumentNode<ConversationChangedSubscription, ConversationChangedSubscriptionVariables>;
export const GetOppsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOpps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getOpps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"opps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OppProps"}}]}}]}}]}},...OppPropsFragmentDoc.definitions]} as unknown as DocumentNode<GetOppsQuery, GetOppsQueryVariables>;
export const UpsertOppDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertOpp"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OppInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertOpp"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OppPayloadProps"}}]}}]}},...OppPayloadPropsFragmentDoc.definitions]} as unknown as DocumentNode<UpsertOppMutation, UpsertOppMutationVariables>;
export const GetOppDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOpp"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getOpp"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OppPayloadProps"}}]}}]}},...OppPayloadPropsFragmentDoc.definitions]} as unknown as DocumentNode<GetOppQuery, GetOppQueryVariables>;
export const GetProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProfileInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"profile"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"contact"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ContactProps"}}]}},{"kind":"Field","name":{"kind":"Name","value":"events"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TimelineEventProps"}}]}}]}}]}}]}},...ContactPropsFragmentDoc.definitions,...TimelineEventPropsFragmentDoc.definitions]} as unknown as DocumentNode<GetProfileQuery, GetProfileQueryVariables>;
export const GetTimelineDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTimeline"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"TimelineInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getTimeline"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TimelinePayloadProps"}}]}}]}},...TimelinePayloadPropsFragmentDoc.definitions]} as unknown as DocumentNode<GetTimelineQuery, GetTimelineQueryVariables>;
export const TimelineEventsAddedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"TimelineEventsAdded"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TimelineEventsAddedInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"timelineEventsAdded"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TimelinePayloadProps"}}]}}]}},...TimelinePayloadPropsFragmentDoc.definitions]} as unknown as DocumentNode<TimelineEventsAddedSubscription, TimelineEventsAddedSubscriptionVariables>;