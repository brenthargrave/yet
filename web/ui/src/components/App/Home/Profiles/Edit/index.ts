import { h, ReactSource } from "@cycle/react"
import { any } from "ramda"
import { compact, reject } from "remeda"
import {
  of,
  combineLatest,
  filter,
  map,
  merge,
  Observable,
  pluck,
  share,
  startWith,
  switchMap,
  withLatestFrom,
  zip,
  mergeMap,
} from "rxjs"
import { isNotNullish } from "rxjs-etc"
import { filterResultErr, filterResultOk } from "ts-results/rxjs-operators"
import { act, Actions, Source as ActionSource } from "~/action"
import { AuthService } from "~/components/App/AuthService"
import { SocialProfile } from "~/components/App/SocialProfile"
import { isEmpty } from "~/fp"
import {
  AuthProvider,
  FromView,
  Source as GraphSource,
  updateProfile$,
  UpdateProfileInput,
} from "~/graph"
import { makeTagger } from "~/log"
import { error } from "~/notice"
import { Source as RouterSource } from "~/router"
import { cb$, shareLatest } from "~/rx"
import { TextInput, Props as TextInputProps } from "./TextInput"
import { InputType } from "./TextInput/View"
import { Props as ViewProps, View, size } from "./View"

export interface Sources {
  react: ReactSource
  router: RouterSource
  graph: GraphSource
  action: ActionSource
}

export const Edit = (sources: Sources, tagPrefix?: string) => {
  const tagScope = `${tagPrefix}/Edit`
  const tag = makeTagger(tagScope)

  const {
    graph: { me$: _me$, profile$: _profile$ },
  } = sources
  const profile$ = _profile$.pipe(tag("profile$"), shareLatest())

  // Name
  const firstName = TextInput(
    {
      props: {
        placeholder: "First Name",
        label: "first_name",
        autoFocus: true,
        prior$: profile$.pipe(
          map(({ firstName }) => firstName),
          tag("firstName$"),
          shareLatest()
        ),
        minimumCharacters: 2,
        size,
      },
    },
    `${tagScope}/FirstName`
  )

  const lastName = TextInput(
    {
      props: {
        placeholder: "Last Name",
        label: "last_name",
        prior$: profile$.pipe(
          map((profile) => profile.lastName),
          tag("lastName$"),
          shareLatest()
        ),
        minimumCharacters: 2,
        size,
      },
    },
    `${tagScope}/LastName`,
    true
  )

  // Work
  const role = TextInput(
    {
      props: {
        placeholder: "Role",
        label: "role",
        prior$: profile$.pipe(
          map((profile) => profile.role),
          tag("role$"),
          shareLatest()
        ),
        size,
      },
    },
    `${tagScope}/Role`
  )
  const org = TextInput(
    {
      props: {
        placeholder: "Organization",
        label: "org",
        prior$: profile$.pipe(
          map((profile) => profile.org),
          tag("org$"),
          shareLatest()
        ),
        size,
      },
    },
    `${tagScope}/Org`
  )

  const location = TextInput(
    {
      props: {
        placeholder: "Location",
        label: "location",
        prior$: profile$.pipe(
          pluck("location"),
          tag("location"),
          shareLatest()
        ),
        size,
      },
    },
    `${tagScope}/Location`
  )

  const website = TextInput(
    {
      props: {
        placeholder: "https://...",
        label: "website",
        prior$: profile$.pipe(pluck("website"), tag("website"), shareLatest()),
        size,
        type: "url",
      },
    },
    `${tagScope}/Website`
  )

  const socials$ = profile$.pipe(
    pluck("socials"),
    tag("socials", false),
    shareLatest()
  )
  const socialsInputs$ = socials$.pipe(
    map((socials) => {
      const [one, two, three, four] = socials
      return [one, two, three, four]
    }),
    tag("socials padded", false),
    map((socials) =>
      socials.map((socialURL, idx) => {
        const label = `Social URL #${idx}`
        const props: TextInputProps = {
          placeholder: "https://...",
          label,
          prior$: of(socialURL),
          size,
        }
        return TextInput({ props }, `${tagPrefix}/Socials#${idx}`)
      })
    ),
    tag("socialsInputs$", false),
    shareLatest()
  )
  const socialsValues = socialsInputs$.pipe(
    switchMap((inputs) => combineLatest(inputs.map((input) => input.value))),
    map((inputValues) => compact(inputValues)),
    tag("socials.values", false),
    share()
  )
  const socialsInputs = socialsInputs$.pipe(
    mergeMap((inputs) => zip(inputs.map((input) => input.react))),
    tag("socials.views"),
    share()
  )

  const email = profile$.pipe(pluck("email"), tag("email$"), shareLatest())
  const phone = profile$.pipe(pluck("phone"), tag("phone$"), shareLatest())
  const e164 = profile$.pipe(pluck("e164"), tag("e164$"), shareLatest())

  const [onSubmit, onSubmit$] = cb$(tag("onSubmit$"))
  const [onCancel, onCancel$] = cb$(tag("onCancel$"))

  const filterNils = <T>(o: Observable<T | null>) =>
    o.pipe(filter(isNotNullish))

  const input$: Observable<UpdateProfileInput> = combineLatest({
    firstName: filterNils(firstName.value),
    lastName: filterNils(lastName.value),
    role: role.value,
    org: org.value,
    location: location.value,
    website: website.value,
    socials: socialsValues,
  }).pipe(tag("input$"), shareLatest())

  const upsert$ = onSubmit$.pipe(
    withLatestFrom(input$),
    switchMap(([_, input]) => updateProfile$(input)),
    tag("upsert$"),
    share()
  )

  const isSaving$ = merge(
    onSubmit$.pipe(map(() => true)),
    upsert$.pipe(map(() => false))
  ).pipe(startWith(false), tag("isSaving"), shareLatest())

  const ok$ = upsert$.pipe(filterResultOk(), tag("ok$"))
  const show$ = merge(ok$, onCancel$).pipe(
    map(() => act(Actions.showProfile)),
    tag("show$"),
    share()
  )

  const error$ = upsert$.pipe(filterResultErr(), tag("userError$"))
  const userError$ = error$.pipe(
    map((e) => error({ description: e.message })),
    tag("userNotice$"),
    share()
  )

  const twitter = AuthService(
    sources,
    {
      provider: AuthProvider.Twitter,
      from: FromView.Profile,
    },
    tagScope
  )
  const { onClickAuth: onClickAuthTwitter, authPending: authPendingTwitter } =
    twitter.value

  const facebook = AuthService(
    sources,
    {
      provider: AuthProvider.Facebook,
      from: FromView.Profile,
    },
    tagScope
  )
  const { onClickAuth: onClickAuthFacebook, authPending: authPendingFacebook } =
    facebook.value

  const social = SocialProfile(
    {
      ...sources,
      props: { profile$, from: FromView.Profile },
    },
    tagScope
  )
  const { onClickSocial } = social.value

  const isDisabledSubmit = combineLatest([
    firstName.isInvalid,
    lastName.isInvalid,
    role.isInvalid,
    org.isInvalid,
  ]).pipe(
    map((sources) => any((a) => a, sources)),
    tag("isDisabledSubmit"),
    shareLatest()
  )

  const props$: Observable<ViewProps> = combineLatest({
    profile: profile$,
    isSaving: isSaving$,
    isDisabledSubmit,
    firstNameInput: firstName.react,
    lastNameInput: lastName.react,
    roleInput: role.react,
    orgInput: org.react,
    locationInput: location.react,
    websiteInput: website.react,
    socialsInputs,
    email,
    phone,
    e164,
    authPendingTwitter,
    authPendingFacebook,
  }).pipe(tag("props$"), shareLatest())

  const react = props$.pipe(
    map((props) =>
      h(View, {
        ...props,
        onSubmit,
        onCancel,
        onClickAuthTwitter,
        onClickAuthFacebook,
        onClickSocial,
      })
    )
  )

  const action = merge(show$)
  const notice = merge(userError$)
  const track = merge(twitter.track, facebook.track, social.track)
  const value = {
    editedProfile$: ok$,
  }

  return {
    react,
    notice,
    action,
    track,
    value,
  }
}
