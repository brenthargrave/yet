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
        else: Map.put(attrs, :style, "text-decoration: #{text_decoration}; color: black;")

    label = Map.get(opts, :aria_label)
    attrs = if label, do: Map.put(attrs, "aria-label", label), else: attrs

    {:a, attrs, {:safe, text}}
    |> XmlBuilder.generate()
  end

  def bold(text) do
    ~s(<b>#{text}</b>)
  end

  # TODO
  # defp profile_url(customer) do
  #   ~s(#{root_url}/p)
  # end
  # def profile_link(customer) do
  # end

  def timeline_events(events) do
    events
    |> Enum.map(fn event ->
      conversation = event.conversation
      note = conversation.note
      date = conversation.occurred_at

      aria = "/c/#{conversation.id}"
      conversation_url = ~s(#{root_url()}#{aria})

      date_fmt = if Timex.now().year == date.year, do: "{Mfull} {D}", else: "{Mfull} {D}, {YYYY}"

      date_formatted =
        date
        |> Timex.format!(date_fmt)

      date_link =
        link(
          ~s(#{date_formatted}),
          conversation_url
        )

      note =
        note
        |> Earmark.as_html!(gfm: true, breaks: true)
        # NOTE: make all note links open new page
        |> String.replace("<a ", "<a style='color: black;' target='_blank' ")
        |> String.replace("<p", "<p style='margin: 0px; padding: 16px 0px 0px 0px;'")
        |> String.replace("<ul", "<ul style='padding-left: 16px; margin: 0px'")

      creator_name = bold(conversation.creator.name)

      others_names =
        Enum.map(conversation.signatures, &bold(&1.signer.name))
        |> RList.to_sentence()

      participants_header = link(~s(#{creator_name} with #{others_names}), conversation_url)

      # var(--chakra-colors-gray-200) #E2E8F0
      note_styled =
        ~s(<div style="border: 1px solid #E2E8F0; padding: 8px 16px 16px 16px; margin: 0px">#{note}</div>)

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
          note: note_styled
        }
      }
    end)
  end
end
