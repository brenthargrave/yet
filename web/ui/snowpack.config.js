// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

const fs = require("fs")
const path = require("path")

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    public: "/",
    // src: "/src",
  },
  plugins: [
    /* ... */
  ],
  packageOptions: {
    source: "remote",
    types: true,
  },
  devOptions: {
    open: "none",
    secure: {
      key: fs.readFileSync(path.resolve("../priv/cert/localhost-key.pem")),
      cert: fs.readFileSync(path.resolve("../priv/cert/localhost-cert.pem")),
    },
    /* ... */
  },
  buildOptions: {
    /* ... */
  },
  alias: {
    "~": "./src/~",
  },
}
