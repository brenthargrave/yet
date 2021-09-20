// @ts-nocheck
// https://vitejs.dev/guide/backend-integration.html
// TODO: debug ui port interpolation
import RefreshRuntime from "https://localhost:8080/@react-refresh"

RefreshRuntime.injectIntoGlobalHook(window)
window.$RefreshReg$ = () => {}
window.$RefreshSig$ = () => (type) => type
// eslint-disable-next-line no-underscore-dangle
window.__vite_plugin_react_preamble_installed__ = true
