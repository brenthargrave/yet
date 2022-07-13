import { Observable } from "rxjs"
import { shareReplay } from "rxjs/operators"
import { Stream } from "xstream"
import { Driver } from "@cycle/run"
import { adapt } from "@cycle/run/lib/adapt"
import { match } from "ts-pattern"
import { toast, ToastProps } from "~/toast"

export interface Source {}

export interface Notice {
  status: "success" | "info" | "warning" | "error"
  title?: string
  description?: string
}

type Sink = Stream<Notice>

export function makeDriver(): Driver<Sink, Source> {
  return function (sink: Sink): Source {
    sink.addListener({
      next: (notice) => {
        toast(notice)
      },
      error: (error) => console.error(error),
      complete: () => console.info("complete"),
    })

    return {}
  }
}

interface NoticeConfig {
  title?: string
  description?: string
}
export const error = ({ title, description }: NoticeConfig): Notice => {
  return {
    status: "error",
    title,
    description,
  }
}
