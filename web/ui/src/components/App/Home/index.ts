import { h, ReactSource } from "@cycle/react"
import { of } from "rxjs"
import { Source as RouterSource } from "~/router"
import { Conversations } from "./Conversations"

interface Sources {
  react: ReactSource
  router: RouterSource
}

export const Home = (sources: Sources) => {
  const { react } = Conversations(sources)

  return {
    react,
  }
}
