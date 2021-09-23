import { defineConfig } from "vite"
import reactRefresh from "@vitejs/plugin-react-refresh"
import codegen from "vite-plugin-graphql-codegen"

import fs from "fs"
import path, { resolve } from "path"

let key
let cert
try {
  key = fs.readFileSync(path.resolve("../priv/cert/localhost-key.pem"))
  cert = fs.readFileSync(path.resolve("../priv/cert/localhost-cert.pem"))
} catch (error) {
  // eslint-disable-next-line no-console
  console.error(error)
}

const { PORT_UI } = process.env
const port: number = parseInt(PORT_UI ?? "8080", 10)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh(), codegen()],
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
