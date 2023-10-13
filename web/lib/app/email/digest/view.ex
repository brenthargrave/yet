defmodule App.Email.Digest.View do
  def root_url do
    "https://#{AppWeb.Endpoint.host()}"
  end

  def link(text, url, opts \\ %{}) do
    attrs = %{href: url, target: "_blank"}

    text_decoration = Map.get(opts, :text_decoration, "none")

    attrs =
      if is_nil(text_decoration),
        do: attrs,
        else:
          Map.put(
            attrs,
            :style,
            "text-decoration: #{text_decoration}; color: black;"
          )

    label = Map.get(opts, :aria_label)
    attrs = if label, do: Map.put(attrs, "aria-label", label), else: attrs

    {:a, attrs, {:safe, text}}
    |> XmlBuilder.generate()
  end

  def bold(text) do
    ~s(<b>#{text}</b>)
  end

  def profile_href(profile) do
    # "https://yet.wip/p/:id"
    ~s(https://#{System.get_env("HOST")}/p/#{profile.id})
  end

  def profile_link(profile, bold \\ true) do
    link =
      link(profile.name, profile_href(profile), %{text_decoration: "underline"})

    if bold, do: bold(link), else: link
  end

  def timeline_events(events) do
    events
    |> Enum.map(fn event ->
      conversation = event.conversation
      notes = Enum.map(conversation.notes, & &1.text)
      date = conversation.occurred_at

      aria = "/c/#{conversation.id}"
      conversation_url = ~s(#{root_url()}#{aria})

      date_fmt =
        if Timex.now().year == date.year,
          do: "{Mfull} {D}",
          else: "{Mfull} {D}, {YYYY}"

      date_formatted =
        date
        |> Timex.format!(date_fmt)

      date_link =
        link(
          ~s(#{date_formatted}),
          conversation_url,
          %{text_decoration: "underline"}
        )

      notes =
        notes
        |> Enum.map(fn note ->
          Earmark.as_html!(note, gfm: true, breaks: true)
          # NOTE: make all note links open new page
          |> String.replace("<a ", "<a style='color: black;' target='_blank' ")
          |> String.replace(
            "<p",
            "<p style='margin: 0px; padding: 16px 0px 0px 0px;'"
          )
          |> String.replace(
            "<ul",
            "<ul style='padding-left: 16px; margin: 0px'"
          )
        end)
        |> Enum.map(fn note ->
          # var(--chakra-colors-gray-200) #E2E8F0
          ~s[<div style="border: 1px solid #E2E8F0; padding: 8px 16px 16px 16px; margin: 0px">#{note}</div>]
        end)

      creator = conversation.creator
      creator_name = profile_link(creator)

      # NOTE: ignore invitees, as only signed conversations in timeline
      others_names =
        Enum.map(conversation.participations, fn p ->
          profile_link(p.participant)
        end)
        |> RList.to_sentence()

      participants_header =
        link(~s(#{creator_name} with #{others_names}), conversation_url)

      %{
        id: event.id,
        kind: event.kind,
        conversation: %{
          id: conversation.id,
          aria: aria,
          link: conversation_url,
          occurred_at: conversation.occurred_at,
          participants_header: participants_header,
          date_link: date_link,
          notes: notes
        }
      }
    end)
  end
end
