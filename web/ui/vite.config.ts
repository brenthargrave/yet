import { defineConfig } from "vite"
import reactRefresh from "@vitejs/plugin-react-refresh"
import codegen from "vite-plugin-graphql-codegen"
import analyze from "rollup-plugin-analyzer"

import fs from "fs"
import path, { resolve } from "path"

const { PORT_UI, MIX_ENV } = process.env

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

const port: number = parseInt(PORT_UI ?? "8080", 10)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh(), codegen(), analyze({ limit: 50 })],
  server: {
    https: { key, cert },
    strictPort: true,
    port,
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
