import { defineConfig, splitVendorChunkPlugin } from "vite"
import reactRefresh from "@vitejs/plugin-react-refresh"
import codegen from "vite-plugin-graphql-codegen"
import analyze from "rollup-plugin-analyzer"
import topLevelAwait from "vite-plugin-top-level-await"
import { sentryVitePlugin, SentryVitePluginOptions } from "@sentry/vite-plugin"

import fs from "fs"
import path, { resolve } from "path"

const { VITE_PORT_UI, MIX_ENV } = process.env

// Terminate the watcher when Phoenix quits
// https://moroz.dev/blog/integrating-vite-js-with-phoenix-1-6/
if (MIX_ENV !== "prod") {
  process.stdin.on("close", () => {
    process.exit(0)
  })
  process.stdin.resume()
}

let key
let cert
try {
  key = fs.readFileSync(path.resolve("../priv/cert/localhost-key.pem"))
  cert = fs.readFileSync(path.resolve("../priv/cert/localhost-cert.pem"))
} catch (error) {
  if (MIX_ENV === "dev") {
    // eslint-disable-next-line no-console
    console.error(error)
  }
}

const port: number = parseInt(VITE_PORT_UI ?? "8080", 10)

const sentryVitePluginOpts: SentryVitePluginOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT_UI,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  debug: Boolean(process.env.VITE_SENTRY_DEBUG),
  telemetry: false,
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    splitVendorChunkPlugin(),
    // NOTE: https://github.com/vitejs/vite/issues/6985#issuecomment-1044375490
    topLevelAwait({
      // The export name of top-level await promise for each chunk module
      promiseExportName: "__tla",
      // The function to generate import names of top-level await promise in each chunk module
      promiseImportName: (i) => `__tla_${i}`,
    }),
    reactRefresh(),
    codegen({
      runOnBuild: false, // disable in production
    }),
    analyze({ limit: 50 }),
    // ! NOTE: sentry after all other plugins
    // https://docs.sentry.io/platforms/javascript/guides/react/sourcemaps/uploading/vite/
    sentryVitePlugin(sentryVitePluginOpts),
  ],
  server: {
    https: { key, cert },
    port,
    strictPort: true,
    // cors: false,
    cors: {
      origin: "*",
      preflightContinue: true,
    },
  },
  build: {
    sourcemap: true,
    outDir: "../priv/static",
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: "/src/index.tsx",
    },
  },
  resolve: {
    // https://git.io/Jz4f5
    alias: {
      "~": resolve(__dirname, "src"),
    },
  },
})
