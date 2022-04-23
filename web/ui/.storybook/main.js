const path = require("path")

const toPath = (_path) => path.join(process.cwd(), _path)

module.exports = {
  stories: [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
  ],
  core: {
    "builder": "storybook-builder-vite"
  },
  viteFinal: (config) => {
    if (process.env.NODE_ENV === 'production') {
      config.build.chunkSizeWarningLimit = 1200
    }
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          // https://git.io/Jz4f5
          "~": path.resolve(__dirname, "../src"),
        },
      }
    }
  }
}
