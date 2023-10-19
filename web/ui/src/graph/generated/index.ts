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
  DateTime: any;
};

export type AnalyticsEvent = {
  __typename?: 'AnalyticsEvent';
  anonId: Scalars['String'];
  customerId?: Maybe<Scalars['String']>;
  name: EventName;
  occurredAt: Scalars['DateTime'];
  properties: EventProperties;
};

export enum AuthProvider {
  Facebook = 'FACEBOOK',
  Twitter = 'TWITTER'
}

export type Contact = {
  __typename?: 'Contact';
  conversationCountWithSubject?: Maybe<Scalars['Int']>;
  description?: Maybe<Scalars['String']>;
  e164?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  facebookImage?: Maybe<Scalars['String']>;
  facebookName?: Maybe<Scalars['String']>;
  facebookUrl?: Maybe<Scalars['String']>;
  firstName: Scalars['String'];
  id: Scalars['ID'];
  lastName: Scalars['String'];
  location?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  org?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  role?: Maybe<Scalars['String']>;
  socials: Array<Scalars['String']>;
  twitterHandle?: Maybe<Scalars['String']>;
  website?: Maybe<Scalars['String']>;
};

export type ContactList = {
  __typename?: 'ContactList';
  contacts: Array<Contact>;
};

export type ContactProfileChanged = {
  __typename?: 'ContactProfileChanged';
  contact: Profile;
  kind: TimelineEventType;
  occurredAt: Scalars['DateTime'];
};

export type Conversation = {
  __typename?: 'Conversation';
  creator: Profile;
  deletedAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  insertedAt?: Maybe<Scalars['DateTime']>;
  invitees: Array<Invitee>;
  notes: Array<Note>;
  occurredAt: Scalars['DateTime'];
  opps: Array<Opp>;
  participations: Array<Participation>;
  status: ConversationStatus;
};

export type ConversationChangedInput = {
  id: Scalars['ID'];
};

export type ConversationInput = {
  id: Scalars['String'];
  invitees: Array<InviteeInput>;
  occurredAt: Scalars['DateTime'];
  status?: InputMaybe<ConversationStatus>;
};

export type ConversationJoinedInput = {
  conversationId: Scalars['ID'];
};

export enum ConversationProp {
  Invitees = 'INVITEES',
  OccurredAt = 'OCCURRED_AT'
}

export type ConversationPublished = {
  __typename?: 'ConversationPublished';
  conversation: Conversation;
  kind: TimelineEventType;
  occurredAt: Scalars['DateTime'];
  persona: Persona;
};

export type ConversationResult = Conversation | UserError;

export enum ConversationStatus {
  Deleted = 'DELETED',
  Draft = 'DRAFT',
  Joined = 'JOINED',
  Proposed = 'PROPOSED'
}

export type ConversationsPayload = {
  __typename?: 'ConversationsPayload';
  conversations: Array<Conversation>;
};

export type CreateEventInput = {
  anonId: Scalars['String'];
  customerId?: InputMaybe<Scalars['String']>;
  name: EventName;
  occurredAt: Scalars['DateTime'];
  properties: EventPropertiesInput;
};

export enum Currency {
  Usd = 'USD'
}

export type Customer = {
  __typename?: 'Customer';
  e164: Scalars['String'];
  email?: Maybe<Scalars['String']>;
  firstName?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  lastName?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  org?: Maybe<Scalars['String']>;
  role?: Maybe<Scalars['String']>;
  token: Scalars['String'];
};

export type DeleteConversationInput = {
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  id: Scalars['String'];
};

export type DeleteNoteInput = {
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  id: Scalars['ID'];
};

export enum ErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export enum EventName {
  DeleteConversation = 'DELETE_CONVERSATION',
  DeleteNote = 'DELETE_NOTE',
  JoinConversation = 'JOIN_CONVERSATION',
  PostNote = 'POST_NOTE',
  SubmitPhoneNumber = 'SUBMIT_PHONE_NUMBER',
  SubscribeNotification = 'SUBSCRIBE_NOTIFICATION',
  TapAddNote = 'TAP_ADD_NOTE',
  TapAuthorize = 'TAP_AUTHORIZE',
  TapNewConversation = 'TAP_NEW_CONVERSATION',
  TapPropose = 'TAP_PROPOSE',
  TapSignin = 'TAP_SIGNIN',
  TapSignup = 'TAP_SIGNUP',
  TapSocial = 'TAP_SOCIAL',
  UnsubscribeNotification = 'UNSUBSCRIBE_NOTIFICATION',
  UpdateConversation = 'UPDATE_CONVERSATION',
  UpdateProfile = 'UPDATE_PROFILE',
  VerifyPhoneNumber = 'VERIFY_PHONE_NUMBER',
  ViewConversation = 'VIEW_CONVERSATION'
}

export type EventProperties = {
  __typename?: 'EventProperties';
  authProvider?: Maybe<AuthProvider>;
  conversationId?: Maybe<Scalars['ID']>;
  intent?: Maybe<Intent>;
  notificationChannel?: Maybe<NotificationChannel>;
  notificationKind?: Maybe<NotificationKind>;
  platform?: Maybe<Platform>;
  signatureCount?: Maybe<Scalars['Int']>;
  socialSite?: Maybe<SocialSite>;
};

export type EventPropertiesInput = {
  authProvider?: InputMaybe<AuthProvider>;
  conversationId?: InputMaybe<Scalars['ID']>;
  conversationProp?: InputMaybe<ConversationProp>;
  countryCode?: InputMaybe<Scalars['String']>;
  intent?: InputMaybe<Intent>;
  notificationChannel?: InputMaybe<NotificationChannel>;
  notificationKind?: InputMaybe<NotificationKind>;
  platform?: InputMaybe<Platform>;
  profileProp?: InputMaybe<ProfileProp>;
  socialDistance?: InputMaybe<Scalars['Int']>;
  socialSite?: InputMaybe<SocialSite>;
  view?: InputMaybe<FromView>;
};

export enum FromView {
  Conversation = 'CONVERSATION',
  Conversations = 'CONVERSATIONS',
  Nav = 'NAV',
  Onboarding = 'ONBOARDING',
  Profile = 'PROFILE',
  Timeline = 'TIMELINE'
}

export type GetOppProfileInput = {
  id: Scalars['ID'];
};

export type GetPaymentInput = {
  id: Scalars['ID'];
};

export type GetPaymentPayload = {
  __typename?: 'GetPaymentPayload';
  payment: Payment;
};

export type GetProfileInput = {
  id: Scalars['ID'];
  timelineFilters?: InputMaybe<TimelineFilters>;
};

export enum Intent {
  Edit = 'EDIT',
  Join = 'JOIN',
  View = 'VIEW'
}

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

export type Mention = {
  __typename?: 'Mention';
  conversation: Conversation;
  id: Scalars['ID'];
  insertedAt: Scalars['DateTime'];
};

export type MentionsInput = {
  oppId: Scalars['ID'];
};

export type MentionsPayload = {
  __typename?: 'MentionsPayload';
  mentions: Array<Mention>;
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

export type MuteProfileInput = {
  active: Scalars['Boolean'];
  profileId: Scalars['ID'];
};

export type Note = {
  __typename?: 'Note';
  conversationId: Scalars['ID'];
  createdAt: Scalars['DateTime'];
  creator: Profile;
  deletedAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  postedAt?: Maybe<Scalars['DateTime']>;
  status: NoteStatus;
  text?: Maybe<Scalars['String']>;
};

export type NoteResult = Note | UserError;

export enum NoteStatus {
  Deleted = 'DELETED',
  Draft = 'DRAFT',
  Posted = 'POSTED'
}

export type NotedAddedInput = {
  conversationId: Scalars['ID'];
};

export enum NotificationChannel {
  Email = 'EMAIL',
  Sms = 'SMS'
}

export enum NotificationKind {
  Digest = 'DIGEST'
}

export type OnboardingProfile = {
  __typename?: 'OnboardingProfile';
  email?: Maybe<Scalars['String']>;
  firstName?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  lastName?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  org?: Maybe<Scalars['String']>;
  role?: Maybe<Scalars['String']>;
};

export type Opp = {
  __typename?: 'Opp';
  creator: Profile;
  desc?: Maybe<Scalars['String']>;
  fee: Money;
  id: Scalars['ID'];
  insertedAt: Scalars['DateTime'];
  org: Scalars['String'];
  owner: Profile;
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

export type OppProfile = {
  __typename?: 'OppProfile';
  events: Array<TimelineEvent>;
  opp: Opp;
};

export type OppProfilePayload = {
  __typename?: 'OppProfilePayload';
  oppProfile: OppProfile;
  userError?: Maybe<UserError>;
};

export type OppsPayload = {
  __typename?: 'OppsPayload';
  opps: Array<Opp>;
};

export type ParticipateInput = {
  conversationUrl: Scalars['String'];
  id: Scalars['ID'];
};

export type Participation = {
  __typename?: 'Participation';
  conversationId: Scalars['ID'];
  id: Scalars['ID'];
  occurredAt: Scalars['DateTime'];
  participant: Profile;
};

export type PatchProfileInput = {
  id: Scalars['String'];
  prop: ProfileProp;
  value: Scalars['String'];
};

export type PatchProfileResult = OnboardingProfile | UserError;

export type Payment = {
  __typename?: 'Payment';
  amount?: Maybe<Money>;
  opp: Opp;
  payee?: Maybe<Profile>;
  payer?: Maybe<Profile>;
  status: PaymentStatus;
};

export enum PaymentStatus {
  Draft = 'DRAFT'
}

export enum Persona {
  Contact = 'CONTACT',
  Opportunist = 'OPPORTUNIST',
  Participant = 'PARTICIPANT',
  Public = 'PUBLIC'
}

export enum Platform {
  Web = 'WEB'
}

export type PostNoteInput = {
  id: Scalars['ID'];
  postedAt?: InputMaybe<Scalars['DateTime']>;
};

export type Profile = {
  __typename?: 'Profile';
  description?: Maybe<Scalars['String']>;
  e164?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  facebookImage?: Maybe<Scalars['String']>;
  facebookName?: Maybe<Scalars['String']>;
  facebookUrl?: Maybe<Scalars['String']>;
  firstName: Scalars['String'];
  id: Scalars['ID'];
  lastName: Scalars['String'];
  location?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  org?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  role?: Maybe<Scalars['String']>;
  socials: Array<Scalars['String']>;
  twitterHandle?: Maybe<Scalars['String']>;
  website?: Maybe<Scalars['String']>;
};

export type ProfileExtended = {
  __typename?: 'ProfileExtended';
  contacts?: Maybe<Array<Contact>>;
  description?: Maybe<Scalars['String']>;
  e164?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  events?: Maybe<Array<TimelineEvent>>;
  facebookImage?: Maybe<Scalars['String']>;
  facebookName?: Maybe<Scalars['String']>;
  facebookUrl?: Maybe<Scalars['String']>;
  firstName: Scalars['String'];
  id: Scalars['ID'];
  isMuted: Scalars['Boolean'];
  lastName: Scalars['String'];
  location?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  org?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  role?: Maybe<Scalars['String']>;
  socialDistance: Scalars['Int'];
  socials: Array<Scalars['String']>;
  twitterHandle?: Maybe<Scalars['String']>;
  website?: Maybe<Scalars['String']>;
};

export type ProfileExtendedResult = ProfileExtended | UserError;

export enum ProfileProp {
  Email = 'EMAIL',
  FirstName = 'FIRST_NAME',
  LastName = 'LAST_NAME',
  Org = 'ORG',
  Role = 'ROLE'
}

export type ProposeInput = {
  id: Scalars['ID'];
  proposedAt?: InputMaybe<Scalars['DateTime']>;
};

export type RootMutationType = {
  __typename?: 'RootMutationType';
  createEvent?: Maybe<AnalyticsEvent>;
  deleteConversation?: Maybe<ConversationResult>;
  deleteNote?: Maybe<NoteResult>;
  muteProfile?: Maybe<ProfileExtendedResult>;
  participate?: Maybe<ConversationResult>;
  patchProfile?: Maybe<PatchProfileResult>;
  postNote?: Maybe<NoteResult>;
  propose?: Maybe<ConversationResult>;
  submitCode?: Maybe<SubmitCodeResult>;
  submitPhone?: Maybe<SubmitPhoneResult>;
  unsubscribe?: Maybe<SettingsEvent>;
  updateProfile?: Maybe<ProfileExtendedResult>;
  upsertConversation?: Maybe<ConversationResult>;
  upsertNote?: Maybe<NoteResult>;
  upsertOpp?: Maybe<OppPayload>;
  upsertPayment?: Maybe<UpsertPaymentPayload>;
};


export type RootMutationTypeCreateEventArgs = {
  input: CreateEventInput;
};


export type RootMutationTypeDeleteConversationArgs = {
  input: DeleteConversationInput;
};


export type RootMutationTypeDeleteNoteArgs = {
  input: DeleteNoteInput;
};


export type RootMutationTypeMuteProfileArgs = {
  input?: InputMaybe<MuteProfileInput>;
};


export type RootMutationTypeParticipateArgs = {
  input: ParticipateInput;
};


export type RootMutationTypePatchProfileArgs = {
  input: PatchProfileInput;
};


export type RootMutationTypePostNoteArgs = {
  input: PostNoteInput;
};


export type RootMutationTypeProposeArgs = {
  input: ProposeInput;
};


export type RootMutationTypeSubmitCodeArgs = {
  input: SubmitCodeInput;
};


export type RootMutationTypeSubmitPhoneArgs = {
  input: SubmitPhoneInput;
};


export type RootMutationTypeUnsubscribeArgs = {
  input: UnsubscribeInput;
};


export type RootMutationTypeUpdateProfileArgs = {
  input?: InputMaybe<UpdateProfileInput>;
};


export type RootMutationTypeUpsertConversationArgs = {
  input: ConversationInput;
};


export type RootMutationTypeUpsertNoteArgs = {
  input: UpsertNoteInput;
};


export type RootMutationTypeUpsertOppArgs = {
  input: OppInput;
};


export type RootMutationTypeUpsertPaymentArgs = {
  input: UpsertPaymentInput;
};

export type RootQueryType = {
  __typename?: 'RootQueryType';
  analyticsEvents: Array<AnalyticsEvent>;
  checkToken?: Maybe<TokenPayload>;
  getContacts?: Maybe<ContactList>;
  getConversation?: Maybe<ConversationResult>;
  getConversations?: Maybe<ConversationsPayload>;
  getOppProfile?: Maybe<OppProfilePayload>;
  getOpps?: Maybe<OppsPayload>;
  getPayment?: Maybe<GetPaymentPayload>;
  getProfile?: Maybe<ProfileExtendedResult>;
  getTimeline?: Maybe<TimelinePayload>;
  me?: Maybe<Customer>;
  mentions?: Maybe<MentionsPayload>;
};


export type RootQueryTypeGetConversationArgs = {
  id: Scalars['ID'];
};


export type RootQueryTypeGetOppProfileArgs = {
  input: GetOppProfileInput;
};


export type RootQueryTypeGetPaymentArgs = {
  input: GetPaymentInput;
};


export type RootQueryTypeGetProfileArgs = {
  input: GetProfileInput;
};


export type RootQueryTypeGetTimelineArgs = {
  input?: InputMaybe<TimelineInput>;
};


export type RootQueryTypeMentionsArgs = {
  input: MentionsInput;
};

export type RootSubscriptionType = {
  __typename?: 'RootSubscriptionType';
  conversationChanged?: Maybe<Conversation>;
  conversationJoined?: Maybe<Participation>;
  noteAdded?: Maybe<Note>;
  timelineEventsAdded?: Maybe<TimelinePayload>;
};


export type RootSubscriptionTypeConversationChangedArgs = {
  input: ConversationChangedInput;
};


export type RootSubscriptionTypeConversationJoinedArgs = {
  input: ConversationJoinedInput;
};


export type RootSubscriptionTypeNoteAddedArgs = {
  input: NotedAddedInput;
};


export type RootSubscriptionTypeTimelineEventsAddedArgs = {
  input: TimelineEventsAddedInput;
};

export type SettingsEvent = {
  __typename?: 'SettingsEvent';
  customerId: Scalars['ID'];
  kind: SettingsEventKind;
  occurredAt: Scalars['DateTime'];
};

export enum SettingsEventKind {
  UnsubscribeDigest = 'UNSUBSCRIBE_DIGEST'
}

export enum SocialSite {
  Facebook = 'FACEBOOK',
  Github = 'GITHUB',
  Linkedin = 'LINKEDIN',
  Twitter = 'TWITTER',
  Website = 'WEBSITE'
}

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
  kind?: InputMaybe<TimelineEventType>;
  omitOwn?: InputMaybe<Scalars['Boolean']>;
  onlyOwn?: InputMaybe<Scalars['Boolean']>;
  onlyWith?: InputMaybe<Scalars['ID']>;
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

export type UnsubscribeInput = {
  customerId: Scalars['ID'];
  kind: SettingsEventKind;
  occurredAt: Scalars['DateTime'];
};

export type UpdateProfileInput = {
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  location?: InputMaybe<Scalars['String']>;
  org?: InputMaybe<Scalars['String']>;
  role?: InputMaybe<Scalars['String']>;
  socials: Array<Scalars['String']>;
  website?: InputMaybe<Scalars['String']>;
};

export type UpsertNoteInput = {
  conversationId: Scalars['ID'];
  createdAt?: InputMaybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  status?: InputMaybe<NoteStatus>;
  text?: InputMaybe<Scalars['String']>;
};

export type UpsertPaymentInput = {
  amount?: InputMaybe<MoneyInput>;
  id: Scalars['ID'];
  oppId: Scalars['ID'];
  payeeId?: InputMaybe<Scalars['ID']>;
};

export type UpsertPaymentPayload = {
  __typename?: 'UpsertPaymentPayload';
  payment?: Maybe<Payment>;
  userError?: Maybe<UserError>;
};

export type UserError = {
  __typename?: 'UserError';
  code: ErrorCode;
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

export type AnalyticsEventPropsFragment = { __typename?: 'AnalyticsEvent', occurredAt: any, name: EventName, anonId: string, customerId?: string | null, properties: { __typename?: 'EventProperties', conversationId?: string | null, intent?: Intent | null, platform?: Platform | null, notificationKind?: NotificationKind | null, notificationChannel?: NotificationChannel | null, socialSite?: SocialSite | null } };

export type CreateEventMutationVariables = Exact<{
  input: CreateEventInput;
}>;


export type CreateEventMutation = { __typename?: 'RootMutationType', createEvent?: { __typename?: 'AnalyticsEvent', occurredAt: any, name: EventName, anonId: string, customerId?: string | null, properties: { __typename?: 'EventProperties', conversationId?: string | null, intent?: Intent | null, platform?: Platform | null, notificationKind?: NotificationKind | null, notificationChannel?: NotificationChannel | null, socialSite?: SocialSite | null } } | null };

export type GetEventsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetEventsQuery = { __typename?: 'RootQueryType', analyticsEvents: Array<{ __typename?: 'AnalyticsEvent', occurredAt: any, name: EventName, anonId: string, customerId?: string | null, properties: { __typename?: 'EventProperties', conversationId?: string | null, intent?: Intent | null, platform?: Platform | null, notificationKind?: NotificationKind | null, notificationChannel?: NotificationChannel | null, socialSite?: SocialSite | null } }> };

export type CheckTokenQueryVariables = Exact<{ [key: string]: never; }>;


export type CheckTokenQuery = { __typename?: 'RootQueryType', checkToken?: { __typename?: 'TokenPayload', token?: { __typename?: 'Token', value?: string | null } | null } | null };

export type AuthenticatedCustomerPropsFragment = { __typename?: 'Customer', id: string, token: string, e164: string, name?: string | null, firstName?: string | null, lastName?: string | null, email?: string | null, org?: string | null, role?: string | null };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'RootQueryType', me?: { __typename?: 'Customer', id: string, token: string, e164: string, name?: string | null, firstName?: string | null, lastName?: string | null, email?: string | null, org?: string | null, role?: string | null } | null };

export type SubmitPhoneMutationVariables = Exact<{
  input: SubmitPhoneInput;
}>;


export type SubmitPhoneMutation = { __typename?: 'RootMutationType', submitPhone?: { __typename?: 'UserError', code: ErrorCode, message: string } | { __typename?: 'Verification', status: VerificationStatus } | null };

export type SubmitCodeMutationVariables = Exact<{
  input: SubmitCodeInput;
}>;


export type SubmitCodeMutation = { __typename?: 'RootMutationType', submitCode?: { __typename?: 'SubmitCodePayload', me: { __typename?: 'Customer', id: string, token: string, e164: string, name?: string | null, firstName?: string | null, lastName?: string | null, email?: string | null, org?: string | null, role?: string | null }, verification: { __typename?: 'Verification', status: VerificationStatus } } | { __typename?: 'UserError', code: ErrorCode, message: string } | null };

export type BaseConversationPropsFragment = { __typename?: 'Conversation', id: string, insertedAt?: any | null, status: ConversationStatus, occurredAt: any, deletedAt?: any | null, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, invitees: Array<{ __typename?: 'Invitee', id: string, name: string, isContact: boolean }>, notes: Array<{ __typename?: 'Note', id: string, conversationId: string, text?: string | null, status: NoteStatus, createdAt: any, deletedAt?: any | null, postedAt?: any | null, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }> };

export type ConversationPropsFragment = { __typename?: 'Conversation', id: string, insertedAt?: any | null, status: ConversationStatus, occurredAt: any, deletedAt?: any | null, participations: Array<{ __typename?: 'Participation', id: string, conversationId: string, occurredAt: any, participant: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }>, opps: Array<{ __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, owner: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }>, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, invitees: Array<{ __typename?: 'Invitee', id: string, name: string, isContact: boolean }>, notes: Array<{ __typename?: 'Note', id: string, conversationId: string, text?: string | null, status: NoteStatus, createdAt: any, deletedAt?: any | null, postedAt?: any | null, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }> };

export type UserErrorPropsFragment = { __typename?: 'UserError', code: ErrorCode, message: string };

export type GetConversationsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetConversationsQuery = { __typename?: 'RootQueryType', getConversations?: { __typename?: 'ConversationsPayload', conversations: Array<{ __typename?: 'Conversation', id: string, insertedAt?: any | null, status: ConversationStatus, occurredAt: any, deletedAt?: any | null, participations: Array<{ __typename?: 'Participation', id: string, conversationId: string, occurredAt: any, participant: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }>, opps: Array<{ __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, owner: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }>, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, invitees: Array<{ __typename?: 'Invitee', id: string, name: string, isContact: boolean }>, notes: Array<{ __typename?: 'Note', id: string, conversationId: string, text?: string | null, status: NoteStatus, createdAt: any, deletedAt?: any | null, postedAt?: any | null, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }> }> } | null };

export type GetConversationQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type GetConversationQuery = { __typename?: 'RootQueryType', getConversation?: { __typename?: 'Conversation', id: string, insertedAt?: any | null, status: ConversationStatus, occurredAt: any, deletedAt?: any | null, participations: Array<{ __typename?: 'Participation', id: string, conversationId: string, occurredAt: any, participant: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }>, opps: Array<{ __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, owner: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }>, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, invitees: Array<{ __typename?: 'Invitee', id: string, name: string, isContact: boolean }>, notes: Array<{ __typename?: 'Note', id: string, conversationId: string, text?: string | null, status: NoteStatus, createdAt: any, deletedAt?: any | null, postedAt?: any | null, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }> } | { __typename?: 'UserError', code: ErrorCode, message: string } | null };

export type UpsertConversationMutationVariables = Exact<{
  input: ConversationInput;
}>;


export type UpsertConversationMutation = { __typename?: 'RootMutationType', upsertConversation?: { __typename?: 'Conversation', id: string, insertedAt?: any | null, status: ConversationStatus, occurredAt: any, deletedAt?: any | null, participations: Array<{ __typename?: 'Participation', id: string, conversationId: string, occurredAt: any, participant: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }>, opps: Array<{ __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, owner: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }>, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, invitees: Array<{ __typename?: 'Invitee', id: string, name: string, isContact: boolean }>, notes: Array<{ __typename?: 'Note', id: string, conversationId: string, text?: string | null, status: NoteStatus, createdAt: any, deletedAt?: any | null, postedAt?: any | null, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }> } | { __typename?: 'UserError', code: ErrorCode, message: string } | null };

export type DeleteConversationMutationVariables = Exact<{
  input: DeleteConversationInput;
}>;


export type DeleteConversationMutation = { __typename?: 'RootMutationType', deleteConversation?: { __typename?: 'Conversation', id: string, insertedAt?: any | null, status: ConversationStatus, occurredAt: any, deletedAt?: any | null, participations: Array<{ __typename?: 'Participation', id: string, conversationId: string, occurredAt: any, participant: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }>, opps: Array<{ __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, owner: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }>, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, invitees: Array<{ __typename?: 'Invitee', id: string, name: string, isContact: boolean }>, notes: Array<{ __typename?: 'Note', id: string, conversationId: string, text?: string | null, status: NoteStatus, createdAt: any, deletedAt?: any | null, postedAt?: any | null, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }> } | { __typename?: 'UserError', code: ErrorCode, message: string } | null };

export type ProposeConversationMutationVariables = Exact<{
  input: ProposeInput;
}>;


export type ProposeConversationMutation = { __typename?: 'RootMutationType', propose?: { __typename?: 'Conversation', id: string, insertedAt?: any | null, status: ConversationStatus, occurredAt: any, deletedAt?: any | null, participations: Array<{ __typename?: 'Participation', id: string, conversationId: string, occurredAt: any, participant: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }>, opps: Array<{ __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, owner: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }>, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, invitees: Array<{ __typename?: 'Invitee', id: string, name: string, isContact: boolean }>, notes: Array<{ __typename?: 'Note', id: string, conversationId: string, text?: string | null, status: NoteStatus, createdAt: any, deletedAt?: any | null, postedAt?: any | null, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }> } | { __typename?: 'UserError', code: ErrorCode, message: string } | null };

export type JoinConversationMutationVariables = Exact<{
  input: ParticipateInput;
}>;


export type JoinConversationMutation = { __typename?: 'RootMutationType', participate?: { __typename?: 'Conversation', id: string, insertedAt?: any | null, status: ConversationStatus, occurredAt: any, deletedAt?: any | null, participations: Array<{ __typename?: 'Participation', id: string, conversationId: string, occurredAt: any, participant: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }>, opps: Array<{ __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, owner: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }>, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, invitees: Array<{ __typename?: 'Invitee', id: string, name: string, isContact: boolean }>, notes: Array<{ __typename?: 'Note', id: string, conversationId: string, text?: string | null, status: NoteStatus, createdAt: any, deletedAt?: any | null, postedAt?: any | null, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }> } | { __typename?: 'UserError', code: ErrorCode, message: string } | null };

export type ConversationChangedSubscriptionVariables = Exact<{
  input: ConversationChangedInput;
}>;


export type ConversationChangedSubscription = { __typename?: 'RootSubscriptionType', conversationChanged?: { __typename?: 'Conversation', id: string, insertedAt?: any | null, status: ConversationStatus, occurredAt: any, deletedAt?: any | null, participations: Array<{ __typename?: 'Participation', id: string, conversationId: string, occurredAt: any, participant: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }>, opps: Array<{ __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, owner: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }>, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, invitees: Array<{ __typename?: 'Invitee', id: string, name: string, isContact: boolean }>, notes: Array<{ __typename?: 'Note', id: string, conversationId: string, text?: string | null, status: NoteStatus, createdAt: any, deletedAt?: any | null, postedAt?: any | null, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }> } | null };

export type ParticipationPropsFragment = { __typename?: 'Participation', id: string, conversationId: string, occurredAt: any, participant: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } };

export type ConversationJoinedSubscriptionVariables = Exact<{
  input: ConversationJoinedInput;
}>;


export type ConversationJoinedSubscription = { __typename?: 'RootSubscriptionType', conversationJoined?: { __typename?: 'Participation', id: string, conversationId: string, occurredAt: any, participant: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } } | null };

export type MoneyPropsFragment = { __typename?: 'Money', amount: number, currency: Currency };

export type NotePropsFragment = { __typename?: 'Note', id: string, conversationId: string, text?: string | null, status: NoteStatus, createdAt: any, deletedAt?: any | null, postedAt?: any | null, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } };

export type UpsertNoteMutationVariables = Exact<{
  input: UpsertNoteInput;
}>;


export type UpsertNoteMutation = { __typename?: 'RootMutationType', upsertNote?: { __typename?: 'Note', id: string, conversationId: string, text?: string | null, status: NoteStatus, createdAt: any, deletedAt?: any | null, postedAt?: any | null, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } } | { __typename?: 'UserError', code: ErrorCode, message: string } | null };

export type DeleteNoteMutationVariables = Exact<{
  input: DeleteNoteInput;
}>;


export type DeleteNoteMutation = { __typename?: 'RootMutationType', deleteNote?: { __typename?: 'Note', id: string, conversationId: string, text?: string | null, status: NoteStatus, createdAt: any, deletedAt?: any | null, postedAt?: any | null, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } } | { __typename?: 'UserError', code: ErrorCode, message: string } | null };

export type PostNoteMutationVariables = Exact<{
  input: PostNoteInput;
}>;


export type PostNoteMutation = { __typename?: 'RootMutationType', postNote?: { __typename?: 'Note', id: string, conversationId: string, text?: string | null, status: NoteStatus, createdAt: any, deletedAt?: any | null, postedAt?: any | null, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } } | { __typename?: 'UserError', code: ErrorCode, message: string } | null };

export type NoteAddedSubscriptionVariables = Exact<{
  input: NotedAddedInput;
}>;


export type NoteAddedSubscription = { __typename?: 'RootSubscriptionType', noteAdded?: { __typename?: 'Note', id: string, conversationId: string, text?: string | null, status: NoteStatus, createdAt: any, deletedAt?: any | null, postedAt?: any | null, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } } | null };

export type OppPropsFragment = { __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, owner: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } };

export type OppPayloadPropsFragment = { __typename?: 'OppPayload', opp?: { __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, owner: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } } | null, userError?: { __typename?: 'UserError', code: ErrorCode, message: string } | null };

export type GetOppsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetOppsQuery = { __typename?: 'RootQueryType', getOpps?: { __typename?: 'OppsPayload', opps: Array<{ __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, owner: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }> } | null };

export type UpsertOppMutationVariables = Exact<{
  input: OppInput;
}>;


export type UpsertOppMutation = { __typename?: 'RootMutationType', upsertOpp?: { __typename?: 'OppPayload', opp?: { __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, owner: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } } | null, userError?: { __typename?: 'UserError', code: ErrorCode, message: string } | null } | null };

export type GetOppProfileQueryVariables = Exact<{
  input: GetOppProfileInput;
}>;


export type GetOppProfileQuery = { __typename?: 'RootQueryType', getOppProfile?: { __typename?: 'OppProfilePayload', userError?: { __typename?: 'UserError', code: ErrorCode, message: string } | null, oppProfile: { __typename?: 'OppProfile', opp: { __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, owner: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }, events: Array<{ __typename?: 'ContactProfileChanged', kind: TimelineEventType, occurredAt: any, contact: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } } | { __typename?: 'ConversationPublished', kind: TimelineEventType, occurredAt: any, persona: Persona, conversation: { __typename?: 'Conversation', id: string, insertedAt?: any | null, status: ConversationStatus, occurredAt: any, deletedAt?: any | null, participations: Array<{ __typename?: 'Participation', id: string, conversationId: string, occurredAt: any, participant: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }>, opps: Array<{ __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, owner: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }>, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, invitees: Array<{ __typename?: 'Invitee', id: string, name: string, isContact: boolean }>, notes: Array<{ __typename?: 'Note', id: string, conversationId: string, text?: string | null, status: NoteStatus, createdAt: any, deletedAt?: any | null, postedAt?: any | null, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }> } }> } } | null };

export type GetMentionsQueryVariables = Exact<{
  input: MentionsInput;
}>;


export type GetMentionsQuery = { __typename?: 'RootQueryType', mentions?: { __typename?: 'MentionsPayload', mentions: Array<{ __typename?: 'Mention', id: string, insertedAt: any, conversation: { __typename?: 'Conversation', id: string, insertedAt?: any | null, status: ConversationStatus, occurredAt: any, deletedAt?: any | null, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, invitees: Array<{ __typename?: 'Invitee', id: string, name: string, isContact: boolean }>, notes: Array<{ __typename?: 'Note', id: string, conversationId: string, text?: string | null, status: NoteStatus, createdAt: any, deletedAt?: any | null, postedAt?: any | null, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }> } }> } | null };

export type PaymentPropsFragment = { __typename?: 'Payment', status: PaymentStatus, amount?: { __typename?: 'Money', amount: number, currency: Currency } | null, opp: { __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, owner: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }, payer?: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } | null, payee?: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } | null };

export type GetPaymentQueryVariables = Exact<{
  input: GetPaymentInput;
}>;


export type GetPaymentQuery = { __typename?: 'RootQueryType', getPayment?: { __typename?: 'GetPaymentPayload', payment: { __typename?: 'Payment', status: PaymentStatus, amount?: { __typename?: 'Money', amount: number, currency: Currency } | null, opp: { __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, owner: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }, payer?: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } | null, payee?: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } | null } } | null };

export type UpsertPaymentMutationVariables = Exact<{
  input: UpsertPaymentInput;
}>;


export type UpsertPaymentMutation = { __typename?: 'RootMutationType', upsertPayment?: { __typename?: 'UpsertPaymentPayload', userError?: { __typename?: 'UserError', code: ErrorCode, message: string } | null, payment?: { __typename?: 'Payment', status: PaymentStatus, amount?: { __typename?: 'Money', amount: number, currency: Currency } | null, opp: { __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, owner: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }, payer?: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } | null, payee?: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } | null } | null } | null };

export type ProfilePropsFragment = { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> };

export type ProfileExtendedPropsFragment = { __typename?: 'ProfileExtended', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, socials: Array<string>, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socialDistance: number, isMuted: boolean };

export type OnboardingProfilePropsFragment = { __typename?: 'OnboardingProfile', id: string, name?: string | null, firstName?: string | null, lastName?: string | null, email?: string | null };

export type ContactPropsFragment = { __typename?: 'Contact', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string>, conversationCountWithSubject?: number | null };

export type GetProfileQueryVariables = Exact<{
  input: GetProfileInput;
}>;


export type GetProfileQuery = { __typename?: 'RootQueryType', getProfile?: { __typename?: 'ProfileExtended', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, socials: Array<string>, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socialDistance: number, isMuted: boolean, events?: Array<{ __typename?: 'ContactProfileChanged', kind: TimelineEventType, occurredAt: any, contact: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } } | { __typename?: 'ConversationPublished', kind: TimelineEventType, occurredAt: any, persona: Persona, conversation: { __typename?: 'Conversation', id: string, insertedAt?: any | null, status: ConversationStatus, occurredAt: any, deletedAt?: any | null, participations: Array<{ __typename?: 'Participation', id: string, conversationId: string, occurredAt: any, participant: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }>, opps: Array<{ __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, owner: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }>, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, invitees: Array<{ __typename?: 'Invitee', id: string, name: string, isContact: boolean }>, notes: Array<{ __typename?: 'Note', id: string, conversationId: string, text?: string | null, status: NoteStatus, createdAt: any, deletedAt?: any | null, postedAt?: any | null, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }> } }> | null, contacts?: Array<{ __typename?: 'Contact', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string>, conversationCountWithSubject?: number | null }> | null } | { __typename?: 'UserError', code: ErrorCode, message: string } | null };

export type UpdateProfileMutationVariables = Exact<{
  input: UpdateProfileInput;
}>;


export type UpdateProfileMutation = { __typename?: 'RootMutationType', updateProfile?: { __typename?: 'ProfileExtended', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, socials: Array<string>, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socialDistance: number, isMuted: boolean } | { __typename?: 'UserError', code: ErrorCode, message: string } | null };

export type PatchProfileMutationVariables = Exact<{
  input: PatchProfileInput;
}>;


export type PatchProfileMutation = { __typename?: 'RootMutationType', patchProfile?: { __typename?: 'OnboardingProfile', id: string, name?: string | null, firstName?: string | null, lastName?: string | null, email?: string | null } | { __typename?: 'UserError', message: string } | null };

export type MuteProfileMutationVariables = Exact<{
  input?: InputMaybe<MuteProfileInput>;
}>;


export type MuteProfileMutation = { __typename?: 'RootMutationType', muteProfile?: { __typename?: 'ProfileExtended', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, socials: Array<string>, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socialDistance: number, isMuted: boolean } | { __typename?: 'UserError', code: ErrorCode, message: string } | null };

export type GetContactsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetContactsQuery = { __typename?: 'RootQueryType', getContacts?: { __typename?: 'ContactList', contacts: Array<{ __typename?: 'Contact', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string>, conversationCountWithSubject?: number | null }> } | null };

export type SettingsEventPropsFragment = { __typename?: 'SettingsEvent', customerId: string, occurredAt: any, kind: SettingsEventKind };

export type UnsubscribeMutationVariables = Exact<{
  input: UnsubscribeInput;
}>;


export type UnsubscribeMutation = { __typename?: 'RootMutationType', unsubscribe?: { __typename?: 'SettingsEvent', customerId: string, occurredAt: any, kind: SettingsEventKind } | null };

export type TimelinePayloadPropsFragment = { __typename?: 'TimelinePayload', events: Array<{ __typename?: 'ContactProfileChanged', kind: TimelineEventType, occurredAt: any, contact: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } } | { __typename?: 'ConversationPublished', kind: TimelineEventType, occurredAt: any, persona: Persona, conversation: { __typename?: 'Conversation', id: string, insertedAt?: any | null, status: ConversationStatus, occurredAt: any, deletedAt?: any | null, participations: Array<{ __typename?: 'Participation', id: string, conversationId: string, occurredAt: any, participant: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }>, opps: Array<{ __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, owner: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }>, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, invitees: Array<{ __typename?: 'Invitee', id: string, name: string, isContact: boolean }>, notes: Array<{ __typename?: 'Note', id: string, conversationId: string, text?: string | null, status: NoteStatus, createdAt: any, deletedAt?: any | null, postedAt?: any | null, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }> } }> };

export type GetTimelineQueryVariables = Exact<{
  input?: InputMaybe<TimelineInput>;
}>;


export type GetTimelineQuery = { __typename?: 'RootQueryType', getTimeline?: { __typename?: 'TimelinePayload', events: Array<{ __typename?: 'ContactProfileChanged', kind: TimelineEventType, occurredAt: any, contact: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } } | { __typename?: 'ConversationPublished', kind: TimelineEventType, occurredAt: any, persona: Persona, conversation: { __typename?: 'Conversation', id: string, insertedAt?: any | null, status: ConversationStatus, occurredAt: any, deletedAt?: any | null, participations: Array<{ __typename?: 'Participation', id: string, conversationId: string, occurredAt: any, participant: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }>, opps: Array<{ __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, owner: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }>, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, invitees: Array<{ __typename?: 'Invitee', id: string, name: string, isContact: boolean }>, notes: Array<{ __typename?: 'Note', id: string, conversationId: string, text?: string | null, status: NoteStatus, createdAt: any, deletedAt?: any | null, postedAt?: any | null, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }> } }> } | null };

export type TimelineEventsAddedSubscriptionVariables = Exact<{
  input: TimelineEventsAddedInput;
}>;


export type TimelineEventsAddedSubscription = { __typename?: 'RootSubscriptionType', timelineEventsAdded?: { __typename?: 'TimelinePayload', events: Array<{ __typename?: 'ContactProfileChanged', kind: TimelineEventType, occurredAt: any, contact: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } } | { __typename?: 'ConversationPublished', kind: TimelineEventType, occurredAt: any, persona: Persona, conversation: { __typename?: 'Conversation', id: string, insertedAt?: any | null, status: ConversationStatus, occurredAt: any, deletedAt?: any | null, participations: Array<{ __typename?: 'Participation', id: string, conversationId: string, occurredAt: any, participant: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }>, opps: Array<{ __typename?: 'Opp', id: string, org: string, role: string, desc?: string | null, url?: string | null, insertedAt: any, fee: { __typename?: 'Money', amount: number, currency: Currency }, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, owner: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }>, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> }, invitees: Array<{ __typename?: 'Invitee', id: string, name: string, isContact: boolean }>, notes: Array<{ __typename?: 'Note', id: string, conversationId: string, text?: string | null, status: NoteStatus, createdAt: any, deletedAt?: any | null, postedAt?: any | null, creator: { __typename?: 'Profile', id: string, name: string, firstName: string, lastName: string, email?: string | null, e164?: string | null, phone?: string | null, role?: string | null, org?: string | null, website?: string | null, location?: string | null, description?: string | null, twitterHandle?: string | null, facebookUrl?: string | null, facebookName?: string | null, facebookImage?: string | null, socials: Array<string> } }> } }> } | null };

export const AnalyticsEventPropsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AnalyticsEventProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AnalyticsEvent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"occurredAt"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"anonId"}},{"kind":"Field","name":{"kind":"Name","value":"properties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"conversationId"}},{"kind":"Field","name":{"kind":"Name","value":"intent"}},{"kind":"Field","name":{"kind":"Name","value":"platform"}},{"kind":"Field","name":{"kind":"Name","value":"notificationKind"}},{"kind":"Field","name":{"kind":"Name","value":"notificationChannel"}},{"kind":"Field","name":{"kind":"Name","value":"socialSite"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}}]}}]} as unknown as DocumentNode<AnalyticsEventPropsFragment, unknown>;
export const AuthenticatedCustomerPropsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AuthenticatedCustomerProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Customer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"e164"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"org"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]} as unknown as DocumentNode<AuthenticatedCustomerPropsFragment, unknown>;
export const ProfilePropsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProfileProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Profile"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"e164"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"org"}},{"kind":"Field","name":{"kind":"Name","value":"website"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"twitterHandle"}},{"kind":"Field","name":{"kind":"Name","value":"facebookUrl"}},{"kind":"Field","name":{"kind":"Name","value":"facebookName"}},{"kind":"Field","name":{"kind":"Name","value":"facebookImage"}},{"kind":"Field","name":{"kind":"Name","value":"socials"}}]}}]} as unknown as DocumentNode<ProfilePropsFragment, unknown>;
export const ParticipationPropsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ParticipationProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Participation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"conversationId"}},{"kind":"Field","name":{"kind":"Name","value":"occurredAt"}},{"kind":"Field","name":{"kind":"Name","value":"participant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProfileProps"}}]}}]}},...ProfilePropsFragmentDoc.definitions]} as unknown as DocumentNode<ParticipationPropsFragment, unknown>;
export const MoneyPropsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MoneyProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Money"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]} as unknown as DocumentNode<MoneyPropsFragment, unknown>;
export const OppPropsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OppProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Opp"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"org"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"desc"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"fee"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyProps"}}]}},{"kind":"Field","name":{"kind":"Name","value":"creator"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProfileProps"}}]}},{"kind":"Field","name":{"kind":"Name","value":"owner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProfileProps"}}]}},{"kind":"Field","name":{"kind":"Name","value":"insertedAt"}}]}},...MoneyPropsFragmentDoc.definitions,...ProfilePropsFragmentDoc.definitions]} as unknown as DocumentNode<OppPropsFragment, unknown>;
export const UserErrorPropsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserErrorProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]} as unknown as DocumentNode<UserErrorPropsFragment, unknown>;
export const OppPayloadPropsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OppPayloadProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OppPayload"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"opp"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OppProps"}}]}},{"kind":"Field","name":{"kind":"Name","value":"userError"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserErrorProps"}}]}}]}},...OppPropsFragmentDoc.definitions,...UserErrorPropsFragmentDoc.definitions]} as unknown as DocumentNode<OppPayloadPropsFragment, unknown>;
export const PaymentPropsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaymentProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Payment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyProps"}}]}},{"kind":"Field","name":{"kind":"Name","value":"opp"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OppProps"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProfileProps"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payee"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProfileProps"}}]}}]}},...MoneyPropsFragmentDoc.definitions,...OppPropsFragmentDoc.definitions,...ProfilePropsFragmentDoc.definitions]} as unknown as DocumentNode<PaymentPropsFragment, unknown>;
export const ProfileExtendedPropsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProfileExtendedProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProfileExtended"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"e164"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"org"}},{"kind":"Field","name":{"kind":"Name","value":"website"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"socials"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"twitterHandle"}},{"kind":"Field","name":{"kind":"Name","value":"facebookUrl"}},{"kind":"Field","name":{"kind":"Name","value":"facebookName"}},{"kind":"Field","name":{"kind":"Name","value":"facebookImage"}},{"kind":"Field","name":{"kind":"Name","value":"socialDistance"}},{"kind":"Field","name":{"kind":"Name","value":"isMuted"}}]}}]} as unknown as DocumentNode<ProfileExtendedPropsFragment, unknown>;
export const OnboardingProfilePropsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OnboardingProfileProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OnboardingProfile"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]} as unknown as DocumentNode<OnboardingProfilePropsFragment, unknown>;
export const ContactPropsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ContactProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Contact"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"e164"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"org"}},{"kind":"Field","name":{"kind":"Name","value":"website"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"twitterHandle"}},{"kind":"Field","name":{"kind":"Name","value":"facebookUrl"}},{"kind":"Field","name":{"kind":"Name","value":"facebookName"}},{"kind":"Field","name":{"kind":"Name","value":"facebookImage"}},{"kind":"Field","name":{"kind":"Name","value":"socials"}},{"kind":"Field","name":{"kind":"Name","value":"conversationCountWithSubject"}}]}}]} as unknown as DocumentNode<ContactPropsFragment, unknown>;
export const SettingsEventPropsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SettingsEventProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SettingsEvent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"occurredAt"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}}]}}]} as unknown as DocumentNode<SettingsEventPropsFragment, unknown>;
export const NotePropsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NoteProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Note"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"conversationId"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"postedAt"}},{"kind":"Field","name":{"kind":"Name","value":"creator"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Profile"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProfileProps"}}]}}]}}]}},...ProfilePropsFragmentDoc.definitions]} as unknown as DocumentNode<NotePropsFragment, unknown>;
export const BaseConversationPropsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BaseConversationProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Conversation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"insertedAt"}},{"kind":"Field","name":{"kind":"Name","value":"creator"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProfileProps"}}]}},{"kind":"Field","name":{"kind":"Name","value":"invitees"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isContact"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"insertedAt"}},{"kind":"Field","name":{"kind":"Name","value":"occurredAt"}},{"kind":"Field","name":{"kind":"Name","value":"deletedAt"}},{"kind":"Field","name":{"kind":"Name","value":"notes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"NoteProps"}}]}}]}},...ProfilePropsFragmentDoc.definitions,...NotePropsFragmentDoc.definitions]} as unknown as DocumentNode<BaseConversationPropsFragment, unknown>;
export const ConversationPropsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ConversationProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Conversation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"BaseConversationProps"}},{"kind":"Field","name":{"kind":"Name","value":"participations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"conversationId"}},{"kind":"Field","name":{"kind":"Name","value":"occurredAt"}},{"kind":"Field","name":{"kind":"Name","value":"participant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProfileProps"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"opps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OppProps"}}]}}]}},...BaseConversationPropsFragmentDoc.definitions,...ProfilePropsFragmentDoc.definitions,...OppPropsFragmentDoc.definitions]} as unknown as DocumentNode<ConversationPropsFragment, unknown>;
export const TimelinePayloadPropsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TimelinePayloadProps"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TimelinePayload"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"events"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ConversationPublished"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"occurredAt"}},{"kind":"Field","name":{"kind":"Name","value":"persona"}},{"kind":"Field","name":{"kind":"Name","value":"conversation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ConversationProps"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ContactProfileChanged"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"occurredAt"}},{"kind":"Field","name":{"kind":"Name","value":"contact"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProfileProps"}}]}}]}}]}}]}},...ConversationPropsFragmentDoc.definitions,...ProfilePropsFragmentDoc.definitions]} as unknown as DocumentNode<TimelinePayloadPropsFragment, unknown>;
export const CreateEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateEventInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AnalyticsEventProps"}}]}}]}},...AnalyticsEventPropsFragmentDoc.definitions]} as unknown as DocumentNode<CreateEventMutation, CreateEventMutationVariables>;
export const GetEventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"analyticsEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AnalyticsEventProps"}}]}}]}},...AnalyticsEventPropsFragmentDoc.definitions]} as unknown as DocumentNode<GetEventsQuery, GetEventsQueryVariables>;
export const CheckTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CheckToken"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkToken"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]} as unknown as DocumentNode<CheckTokenQuery, CheckTokenQueryVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AuthenticatedCustomerProps"}}]}}]}},...AuthenticatedCustomerPropsFragmentDoc.definitions]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const SubmitPhoneDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SubmitPhone"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SubmitPhoneInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitPhone"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Verification"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserErrorProps"}}]}}]}}]}},...UserErrorPropsFragmentDoc.definitions]} as unknown as DocumentNode<SubmitPhoneMutation, SubmitPhoneMutationVariables>;
export const SubmitCodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SubmitCode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SubmitCodeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitCode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubmitCodePayload"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AuthenticatedCustomerProps"}}]}},{"kind":"Field","name":{"kind":"Name","value":"verification"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserErrorProps"}}]}}]}}]}},...AuthenticatedCustomerPropsFragmentDoc.definitions,...UserErrorPropsFragmentDoc.definitions]} as unknown as DocumentNode<SubmitCodeMutation, SubmitCodeMutationVariables>;
export const GetConversationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetConversations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getConversations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"conversations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ConversationProps"}}]}}]}}]}},...ConversationPropsFragmentDoc.definitions]} as unknown as DocumentNode<GetConversationsQuery, GetConversationsQueryVariables>;
export const GetConversationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetConversation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getConversation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Conversation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ConversationProps"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserErrorProps"}}]}}]}}]}},...ConversationPropsFragmentDoc.definitions,...UserErrorPropsFragmentDoc.definitions]} as unknown as DocumentNode<GetConversationQuery, GetConversationQueryVariables>;
export const UpsertConversationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertConversation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ConversationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertConversation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Conversation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ConversationProps"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserErrorProps"}}]}}]}}]}},...ConversationPropsFragmentDoc.definitions,...UserErrorPropsFragmentDoc.definitions]} as unknown as DocumentNode<UpsertConversationMutation, UpsertConversationMutationVariables>;
export const DeleteConversationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteConversation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteConversationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteConversation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Conversation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ConversationProps"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserErrorProps"}}]}}]}}]}},...ConversationPropsFragmentDoc.definitions,...UserErrorPropsFragmentDoc.definitions]} as unknown as DocumentNode<DeleteConversationMutation, DeleteConversationMutationVariables>;
export const ProposeConversationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ProposeConversation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProposeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"propose"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Conversation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ConversationProps"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserErrorProps"}}]}}]}}]}},...ConversationPropsFragmentDoc.definitions,...UserErrorPropsFragmentDoc.definitions]} as unknown as DocumentNode<ProposeConversationMutation, ProposeConversationMutationVariables>;
export const JoinConversationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"JoinConversation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ParticipateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"participate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Conversation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ConversationProps"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserErrorProps"}}]}}]}}]}},...ConversationPropsFragmentDoc.definitions,...UserErrorPropsFragmentDoc.definitions]} as unknown as DocumentNode<JoinConversationMutation, JoinConversationMutationVariables>;
export const ConversationChangedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"ConversationChanged"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ConversationChangedInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"conversationChanged"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ConversationProps"}}]}}]}},...ConversationPropsFragmentDoc.definitions]} as unknown as DocumentNode<ConversationChangedSubscription, ConversationChangedSubscriptionVariables>;
export const ConversationJoinedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"ConversationJoined"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ConversationJoinedInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"conversationJoined"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ParticipationProps"}}]}}]}},...ParticipationPropsFragmentDoc.definitions]} as unknown as DocumentNode<ConversationJoinedSubscription, ConversationJoinedSubscriptionVariables>;
export const UpsertNoteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertNote"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertNoteInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertNote"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Note"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"NoteProps"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserErrorProps"}}]}}]}}]}},...NotePropsFragmentDoc.definitions,...UserErrorPropsFragmentDoc.definitions]} as unknown as DocumentNode<UpsertNoteMutation, UpsertNoteMutationVariables>;
export const DeleteNoteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteNote"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteNoteInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteNote"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Note"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"NoteProps"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserErrorProps"}}]}}]}}]}},...NotePropsFragmentDoc.definitions,...UserErrorPropsFragmentDoc.definitions]} as unknown as DocumentNode<DeleteNoteMutation, DeleteNoteMutationVariables>;
export const PostNoteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PostNote"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PostNoteInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"postNote"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Note"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"NoteProps"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserErrorProps"}}]}}]}}]}},...NotePropsFragmentDoc.definitions,...UserErrorPropsFragmentDoc.definitions]} as unknown as DocumentNode<PostNoteMutation, PostNoteMutationVariables>;
export const NoteAddedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"NoteAdded"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NotedAddedInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"noteAdded"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"NoteProps"}}]}}]}},...NotePropsFragmentDoc.definitions]} as unknown as DocumentNode<NoteAddedSubscription, NoteAddedSubscriptionVariables>;
export const GetOppsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOpps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getOpps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"opps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OppProps"}}]}}]}}]}},...OppPropsFragmentDoc.definitions]} as unknown as DocumentNode<GetOppsQuery, GetOppsQueryVariables>;
export const UpsertOppDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertOpp"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OppInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertOpp"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OppPayloadProps"}}]}}]}},...OppPayloadPropsFragmentDoc.definitions]} as unknown as DocumentNode<UpsertOppMutation, UpsertOppMutationVariables>;
export const GetOppProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOppProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetOppProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getOppProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userError"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserErrorProps"}}]}},{"kind":"Field","name":{"kind":"Name","value":"oppProfile"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"opp"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OppProps"}}]}},{"kind":"Field","name":{"kind":"Name","value":"events"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ConversationPublished"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"occurredAt"}},{"kind":"Field","name":{"kind":"Name","value":"persona"}},{"kind":"Field","name":{"kind":"Name","value":"conversation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ConversationProps"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ContactProfileChanged"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"occurredAt"}},{"kind":"Field","name":{"kind":"Name","value":"contact"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProfileProps"}}]}}]}}]}}]}}]}}]}},...UserErrorPropsFragmentDoc.definitions,...OppPropsFragmentDoc.definitions,...ConversationPropsFragmentDoc.definitions,...ProfilePropsFragmentDoc.definitions]} as unknown as DocumentNode<GetOppProfileQuery, GetOppProfileQueryVariables>;
export const GetMentionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMentions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MentionsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mentions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mentions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"insertedAt"}},{"kind":"Field","name":{"kind":"Name","value":"conversation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"BaseConversationProps"}}]}}]}}]}}]}},...BaseConversationPropsFragmentDoc.definitions]} as unknown as DocumentNode<GetMentionsQuery, GetMentionsQueryVariables>;
export const GetPaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPayment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetPaymentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getPayment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaymentProps"}}]}}]}}]}},...PaymentPropsFragmentDoc.definitions]} as unknown as DocumentNode<GetPaymentQuery, GetPaymentQueryVariables>;
export const UpsertPaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertPayment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertPaymentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertPayment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userError"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserErrorProps"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaymentProps"}}]}}]}}]}},...UserErrorPropsFragmentDoc.definitions,...PaymentPropsFragmentDoc.definitions]} as unknown as DocumentNode<UpsertPaymentMutation, UpsertPaymentMutationVariables>;
export const GetProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProfileExtended"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProfileExtendedProps"}},{"kind":"Field","name":{"kind":"Name","value":"events"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ConversationPublished"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"occurredAt"}},{"kind":"Field","name":{"kind":"Name","value":"persona"}},{"kind":"Field","name":{"kind":"Name","value":"conversation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ConversationProps"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ContactProfileChanged"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"occurredAt"}},{"kind":"Field","name":{"kind":"Name","value":"contact"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProfileProps"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"contacts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ContactProps"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserErrorProps"}}]}}]}}]}},...ProfileExtendedPropsFragmentDoc.definitions,...ConversationPropsFragmentDoc.definitions,...ProfilePropsFragmentDoc.definitions,...ContactPropsFragmentDoc.definitions,...UserErrorPropsFragmentDoc.definitions]} as unknown as DocumentNode<GetProfileQuery, GetProfileQueryVariables>;
export const UpdateProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProfileExtended"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProfileExtendedProps"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserErrorProps"}}]}}]}}]}},...ProfileExtendedPropsFragmentDoc.definitions,...UserErrorPropsFragmentDoc.definitions]} as unknown as DocumentNode<UpdateProfileMutation, UpdateProfileMutationVariables>;
export const PatchProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PatchProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PatchProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"patchProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OnboardingProfile"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OnboardingProfileProps"}}]}}]}}]}},...OnboardingProfilePropsFragmentDoc.definitions]} as unknown as DocumentNode<PatchProfileMutation, PatchProfileMutationVariables>;
export const MuteProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MuteProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"MuteProfileInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"muteProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProfileExtended"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProfileExtendedProps"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserErrorProps"}}]}}]}}]}},...ProfileExtendedPropsFragmentDoc.definitions,...UserErrorPropsFragmentDoc.definitions]} as unknown as DocumentNode<MuteProfileMutation, MuteProfileMutationVariables>;
export const GetContactsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetContacts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getContacts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"contacts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ContactProps"}}]}}]}}]}},...ContactPropsFragmentDoc.definitions]} as unknown as DocumentNode<GetContactsQuery, GetContactsQueryVariables>;
export const UnsubscribeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Unsubscribe"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UnsubscribeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unsubscribe"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SettingsEventProps"}}]}}]}},...SettingsEventPropsFragmentDoc.definitions]} as unknown as DocumentNode<UnsubscribeMutation, UnsubscribeMutationVariables>;
export const GetTimelineDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTimeline"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"TimelineInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getTimeline"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TimelinePayloadProps"}}]}}]}},...TimelinePayloadPropsFragmentDoc.definitions]} as unknown as DocumentNode<GetTimelineQuery, GetTimelineQueryVariables>;
export const TimelineEventsAddedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"TimelineEventsAdded"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TimelineEventsAddedInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"timelineEventsAdded"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TimelinePayloadProps"}}]}}]}},...TimelinePayloadPropsFragmentDoc.definitions]} as unknown as DocumentNode<TimelineEventsAddedSubscription, TimelineEventsAddedSubscriptionVariables>;