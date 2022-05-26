import { h } from '@cycle/react';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import type { Parameters } from '@storybook/addons';
import { addDecorator } from '@storybook/react';
// @ts-ignore
import { View } from "~/components/App/View";

addDecorator(
  (Story) => (
    h(View, [
      h(Story)
    ])
  ))

export const parameters: Parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  viewport: {
    viewports: INITIAL_VIEWPORTS,
    defaultViewport: "iphone12mini"
  },
  layout: "fullscreen"
}
