import { Spacer } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { useObservable } from "react-use"
import { map, share, tap } from "rxjs"
import { isAuthenticated, me$ } from "~/graph"
import { t } from "~/i18n"
import { push, routes } from "~/router"
import { cb$ } from "~/rx"
import { AriaButton, BackButton, Header } from "~/system"

// NOTE: cheat, inject auth functionality w/ global vars
const [onClickAuth, onClickAuth$] = cb$(share())
export const redirectToAuth$ = onClickAuth$.pipe(
  map((_) => push(routes.in())),
  share()
)

interface Props {
  onClickBack?: () => void
  backButtonText?: string
}

export const Nav: FC<Props> = ({ onClickBack, backButtonText: cta }) => {
  const authenticated = useObservable(
    me$.pipe(
      map((me) => isAuthenticated(me)),
      share()
    ),
    true
  )

  return h(Header, { paddingBottom: 0 }, [
    authenticated &&
      onClickBack &&
      h(BackButton, {
        cta,
        onClick: onClickBack,
      }),
    h(Spacer, { minHeight: "24px" }),
    !authenticated && h(AriaButton, { onClick: onClickAuth }, t("app.auth")),
  ])
}
