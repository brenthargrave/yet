import { MouseButton } from "puppeteer"

export interface ClickOptions {
  delay?: number
  button?: MouseButton
  clickCount?: number
}
