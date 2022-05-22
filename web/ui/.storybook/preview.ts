import type { Parameters } from '@storybook/addons'
import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { h } from '@cycle/react';
import { addDecorator } from '@storybook/react';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';

addDecorator(
  (Story) => (
    h(ChakraProvider, [
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
