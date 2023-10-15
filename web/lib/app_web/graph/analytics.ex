defmodule AppWeb.Graph.Analytics do
  use Absinthe.Schema.Notation
  alias AppWeb.Resolvers

  enum :event_name do
    value(:tap_signup, as: "tap_signup")
    value(:tap_signin, as: "tap_signin")
    value(:submit_phone_number, as: "submit_phone_number")
    value(:verify_phone_number, as: "verify_phone_number")
    value(:update_profile, as: "update_profile")
    value(:tap_new_conversation, as: "tap_new_conversation")
    value(:update_conversation, as: "update_conversation")
    value(:delete_conversation, as: "delete_conversation")
    value(:tap_propose, as: "tap_propose")
    value(:join_conversation, as: "join_conversation")
    value(:view_conversation, as: "view_conversation")
    value(:tap_add_note, as: "tap_add_note")
    value(:unsubscribe_notification, as: "unsubscribe_notification")
    value(:subscribe_notification, as: "subscribe_notification")
    value(:tap_authorize, as: "tap_authorize")
    value(:tap_social, as: "tap_social")
    value(:delete_note, as: "delete_note")
    value(:post_note, as: "post_note")
  end

  enum :intent do
    value(:join, as: "join")
    value(:view, as: "view")
    value(:edit, as: "edit")
  end

  enum :platform do
    value(:web, as: "web")
  end

  enum :notification_channel do
    value(:email, as: "email")
    value(:sms, as: "sms")
  end

  enum :notification_kind do
    value(:digest, as: "digest")
  end

  enum :social_site do
    value(:twitter, as: :twitter)
    value(:facebook, as: :facebook)
    value(:github, as: :github)
    value(:linkedin, as: :linkedin)
    value(:website, as: :website)
  end

  enum :from_view do
    value(:nav, as: "nav")
    value(:conversations, as: "conversations")
    value(:conversation, as: "conversation")
    value(:timeline, as: "timeline")
    value(:profile, as: "profile")
    value(:onboarding, as: "onboarding")
  end

  enum :conversation_prop do
    value(:occurred_at, as: "occurred_at")
    value(:invitees, as: "invitees")
  end

  # TODO: macro to dedupe input_object/object
  input_object :event_properties_input do
    field(:conversation_id, :id)
    field(:intent, :intent)
    field(:platform, :platform)
    field(:view, :from_view)
    # notifications
    field(:notification_channel, :notification_channel)
    field(:notification_kind, :notification_kind)
    # oauth
    field(:auth_provider, :auth_provider)
    # profiles
    field(:social_distance, :integer)
    field(:social_site, :social_site)
    # onboarding
    field(:country_code, :string)
    field(:profile_prop, :profile_prop)
    # conversations
    field(:conversation_prop, :conversation_prop)
    #
  end

  object :event_properties do
    field(:conversation_id, :id)
    field(:intent, :intent)
    field(:platform, :platform)
    field(:signature_count, :integer)
    # notifications
    field(:notification_channel, :notification_channel)
    field(:notification_kind, :notification_kind)
    # oauth
    field(:auth_provider, :auth_provider)
    field(:social_site, :social_site)
  end

  input_object :create_event_input do
    field(:occurred_at, non_null(:datetime))
    field(:name, non_null(:event_name))
    field(:anon_id, non_null(:string))
    field(:properties, non_null(:event_properties_input))
    field(:customer_id, :string)
  end

  object :analytics_event do
    field(:occurred_at, non_null(:datetime))
    field(:name, non_null(:event_name))
    field(:anon_id, non_null(:string))
    field(:properties, non_null(:event_properties))
    field(:customer_id, :string)
  end

  object :analytics_mutations do
    field :create_event, :analytics_event do
      arg(:input, non_null(:create_event_input))
      resolve(&Resolvers.Analytics.track_event/3)
    end
  end

  object :analytics_queries do
    field :analytics_events, non_null(list_of(non_null(:analytics_event))) do
      resolve(&Resolvers.Analytics.events/3)
    end
  end
end
