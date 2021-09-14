import React from "react";
import ReactDOM from "react-dom";

// NOTE: import env vars: https://git.io/Ju5w6
// @ts-ignore
const { MIX_ENV } = import.meta.env;
console.debug(`MIX_ENV : ${MIX_ENV}`);

ReactDOM.render(<div>"HELLO REACT"</div>, document.getElementById("main"));
