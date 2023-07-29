defmodule App.Email.Digest do
  require Slime
  use Brex.Result
  alias Swoosh.{Email}
  import Ecto.Query
  import I18n
  alias App.{Repo, Customer}
  alias __MODULE__.{View}
  import View

  def debug() do
    System.get_env("DEBUG_EMAIL") != nil
  end

  def send_all do
    debug = debug()

    digest_subscribers =
      from(c in Customer, where: c.digest == true)
      |> Repo.all()

    Enum.each(digest_subscribers, fn customer ->
      build_and_deliver_email(customer, %{debug: debug})
    end)
  end

  def build_and_deliver_email(customer, opts \\ %{}) do
    build_email(customer, opts)
    |> fmap(&App.Email.Mailer.deliver(&1))
  end

  def build_email(customer, opts \\ %{}) do
    admin_address = System.get_env("ADMIN_EMAIL")

    debug = Map.get(opts, :debug, true)

    now = DateTime.utc_now()

    # default_since = Timex.shift(now, hours: -24)
    default_since =
      if debug,
        do: Timex.shift(now, years: -10),
        else: Timex.shift(now, hours: -24)

    since = Map.get(opts, :since, default_since)
    omit_own = Map.get(opts, :omit_own, true)

    events =
      App.Timeline.get_events(customer, %{
        kind: :conversation_published,
        omit_own: omit_own,
        occurred_after: since
      })
      |> extract!()

    app_name = System.get_env("PRODUCT_NAME")
    from_address = System.get_env("EMAIL_FROM_ADDRESS") || admin_address
    todayFormatted = Timex.format!(Timex.now(), "{Mfull} {D}, {YYYY}")

    # TODO: require authentication?
    unsubscribe_url = ~s(#{root_url()}/unsubscribe/digest/#{customer.id})

    unsubscribe_digest_link =
      link("Unsubscribe from digests.", unsubscribe_url, %{
        text_decoration: "underline",
        aria_label: "Unsubscribe"
      })

    unsubscribe_all_link =
      link(
        "Unsubscribe from everything.",
        "{{{ pm:unsubscribe }}}",
        %{
          text_decoration: "underline",
          aria_label: "Unsubscribe all"
        }
      )

    props = %{
      reload: true,
      unsubscribe_digest_link: unsubscribe_digest_link,
      unsubscribe_all_link: unsubscribe_all_link,
      style: %{
        font_size: "14px",
        font_family: "system-ui,sans-serif"
      },
      product_name: t(:product_name),
      digest_header: t([:digest, :header]),
      today: todayFormatted,
      viewer: customer,
      events: timeline_events(events)
    }

    env = System.get_env("MIX_ENV")
    html = __MODULE__.html(props)
    text = Premailex.to_text(html)
    to_email = if debug, do: admin_address, else: customer.email
    subjects = [t([:digest, :header]), todayFormatted]
    subjects = if env == "prod", do: subjects, else: subjects ++ [env]
    subject = Enum.join(subjects, " - ")

    email =
      Email.new()
      |> Email.to({customer.name, to_email})
      |> Email.from({app_name, from_address})
      |> Email.subject(subject)
      |> Email.html_body(html)
      |> Email.text_body(text)

    email
    |> ok()
    |> bind(&if Enum.empty?(events), do: error("no-op; no events"), else: ok(&1))
  end

  Slime.function_from_file(
    :def,
    :digest_mjml,
    Path.dirname(__ENV__.file) |> Path.join("digest.mjml.slim"),
    [:props]
  )

  def html(assigns) do
    __MODULE__.digest_mjml(assigns)
    |> Mjml.to_html()
    |> extract!()
  end
end
