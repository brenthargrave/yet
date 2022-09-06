import { color, rgb, rgba } from "csx"

// export const maxWidth = 468
export const maxWidth = { base: "468px", md: "678px" }

export const modalStyleProps = {
  minHeight: "70vh",
}

export const containerProps = {
  minHeight: "70vh",
  width: "100%",
  height: "100%",
}

export const paddingDefault = 4

export const white = "#fff"

export const lightGray = rgb(237, 242, 248).toString()

// status colors
const alpha = 0.5
export const lightYellow = rgb(254, 252, 192, 0.5).toString()
export const lightGreen = rgb(198, 246, 214, 0.3).toString()

export const ariaLabel = (value: string) => {
  return { "aria-label": value }
}
