/* eslint-disable no-console */
import { Driver } from "@cycle/run"
import { Stream } from "xstream"
import { toast } from "~/toast"

export interface Source {}

export interface Notice {
  status: "success" | "info" | "warning" | "error"
  title?: string
  description?: string
}

type Sink = Stream<Notice>

export function makeDriver(): Driver<Sink, Source> {
  return (sink: Sink): Source => {
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

export const info = ({ title, description }: NoticeConfig): Notice => {
  return {
    status: "info",
    title,
    description,
  }
}
