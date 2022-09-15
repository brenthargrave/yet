import { MouseButton } from "puppeteer"
import { PuppeteerLaunchOptions } from "puppeteer"
export { PuppeteerLaunchOptions as LaunchOptions }

export interface ClickOptions {
  delay?: number
  button?: MouseButton
  clickCount?: number
}
