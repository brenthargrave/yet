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
    static: { url: "/" },
  },
  plugins: [
    // '@snowpack/plugin-react-refresh'
  ],
  packageOptions: {
    source: "local",
    types: true,
  },
  devOptions: {
    open: "none",
    secure: {
      key: key,
      cert: cert,
    },
  },
  buildOptions: {
    out: "../priv/static",
    sourcemap: true,
  },
  alias: {
    "~": "./src/~",
  },
};
