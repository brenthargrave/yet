/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-dynamic-require */
// @ts-nocheck

// https://vitejs.dev/guide/backend-integration.html

// eslint-disable
import RefreshRuntime from `https://localhost:8080/@react-refresh`

// @ts-ignore
// const { VITE_PORT_UI } = import.meta.env
// const RefreshRuntime = require(`https://localhost:${VITE_PORT_UI}/@react-refresh`)

RefreshRuntime.injectIntoGlobalHook(window)
window.$RefreshReg$ = () => {}
window.$RefreshSig$ = () => (type) => type
// eslint-disable-next-line no-underscore-dangle
window.__vite_plugin_react_preamble_installed__ = true
