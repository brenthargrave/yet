// https://www.snowpack.dev/reference/configuration

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

const { MIX_ENV } = process.env;

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  env: {
    MIX_ENV,
  },
  mount: {
    static: { url: "/" },
  },
  plugins: [],
  packageOptions: {
    source: "local",
    types: true,
  },
  devOptions: {
    open: "none",
    secure: {
      key,
      cert,
    },
  },
  buildOptions: {
    out: "../priv/static",
    // TODO
    // https://www.snowpack.dev/reference/configuration#buildoptionssourcemap
    // > Experimental: Still in progress...
    sourcemap: false,
  },
  //   alias: {
  //     "~": "./src/~",
  //   },
};
