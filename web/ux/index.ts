import { globSync } from "glob"
import Mocha from "mocha"

export * from "./src/browser"

const mocha = new Mocha()

// mocha.unloadFiles()

mocha.timeout(120 * 1000)

// mocha.addFile(`./test/view-conversation-while-unauthenticated.spec.ts`)
const files = globSync("./test/*.spec.ts")
files.forEach((file) => mocha.addFile(file))

mocha.fullTrace()

mocha.slow(0)

const runner = mocha.run((failures) => {
  if (failures > 0) {
    process.exit(1)
  }
})

// TODO: make sure to clear files on reruns
// mocha.unloadFiles()
// TODO: parallelize tests, call before run
// mocha.parallelMode(true)
