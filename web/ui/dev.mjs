import { spawnSync } from "child_process"

const ps = spawnSync(
  `./node_modules/vite/bin/vite.js`,
  {},
  { stdio: "inherit " }
)

const killAndExit = () => {
  // NOTE: kill entire spawned process group
  // http://azimi.me/2014/12/31/kill-child_process-node-js.html
  process.kill(-ps.pid)
  process.exit()
}

process.on("SIGINT", (message) => {
  killAndExit()
})

process.stdin.on("close", () => {
  killAndExit()
})
