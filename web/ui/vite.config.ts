import { defineConfig } from "vite"
import reactRefresh from "@vitejs/plugin-react-refresh"

import fs from "fs"
import path from "path"

let key
let cert
try {
  key = fs.readFileSync(path.resolve("../priv/cert/localhost-key.pem"))
  cert = fs.readFileSync(path.resolve("../priv/cert/localhost-cert.pem"))
} catch (error) {
  console.error(error)
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  server: {
    https: { key, cert },
  },
})
