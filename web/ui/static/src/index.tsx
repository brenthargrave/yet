import React from "react";
import ReactDOM from "react-dom";

// NOTE: import env vars: https://git.io/Ju5w6
// @ts-ignore
const { MIX_ENV } = import.meta.env;
console.debug(`MIX_ENV : ${MIX_ENV}`);

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

ReactDOM.render(<div>"HELLO REACT"</div>, document.getElementById("main"));
