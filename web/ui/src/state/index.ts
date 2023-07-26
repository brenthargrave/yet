import { interpret, createMachine } from "xstate"
import { from } from "rxjs"

interface ToggleContext {
  count: number
}

type ToggleEvent = {
  type: "TOGGLE"
}

const machine = createMachine<ToggleContext, ToggleEvent>({
  id: "root",
  initial: "inactive",
  context: {
    count: 0,
  },
  states: {
    inactive: {
      on: { TOGGLE: "active" },
    },
    active: {
      on: { TOGGLE: "inactive" },
    },
  },
})

const interpreter = interpret(machine)
const service = interpreter.start()

export const state$ = from(service)

service.send("TOGGLE")
service.send("TOGGLE")

// type Sink = Stream<Command>

// export function makeDriver(): Driver<Sink, Source> {
//   return function (sink: Sink): Source {
//     sink.addListener({
//       next: ({ type, route }) => {
//         match(type)
//           .with(CommandType.push, () => route?.push())
//           .exhaustive()
//       },
//       error: (error) => captureException(error),
//       complete: () => console.info("complete"),
//     })

//     const history$ = new Observable<Route>((observer) => {
//       observer.next(session.getInitialRoute())
//       const unlisten = session.listen((route) => {
//         observer.next(route)
//       })
//       return unlisten
//     }).pipe(tag("history$"), shareLatest())

//     return {
//       history$,
//     }
//   }
// }
