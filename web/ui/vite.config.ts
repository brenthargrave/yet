import { defineConfig } from "vite"
import reactRefresh from "@vitejs/plugin-react-refresh"
import codegen from "vite-plugin-graphql-codegen"
import analyze from "rollup-plugin-analyzer"
import topLevelAwait from "vite-plugin-top-level-await"

import fs from "fs"
import path, { resolve } from "path"

const { VITE_PORT_UI, MIX_ENV } = process.env

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

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
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
