import React from "react"
import ReactDOM from "react-dom"
import { h } from "@cycle/react"

import { App } from "./components/App"

ReactDOM.render(h(React.StrictMode, [h(App)]), document.getElementById("index"))
