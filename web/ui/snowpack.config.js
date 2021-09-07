// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

const fs = require("fs");
const path = require("path");

let key;
let cert;
try {
  key = fs.readFileSync(path.resolve("../priv/cert/localhost-key.pem"));
  cert = fs.readFileSync(path.resolve("../priv/cert/localhost-cert.pem"));
} catch (error) {
  console.error(error);
}

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    // public: { url: "/", static: true },
    public: "/",
    // src: "/src",
  },
  plugins: [
    // '@snowpack/plugin-react-refresh'
  ],
  packageOptions: {
    source: "remote",
    types: true,
  },
  devOptions: {
    open: "none",
    secure: {
      key: key,
      cert: cert,
    },
    /* ... */
  },
  buildOptions: {
    out: "../priv/static/",
    sourcemap: true,
  },
  alias: {
    "~": "./src/~",
  },
};
