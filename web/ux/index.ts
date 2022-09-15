import Mocha from "mocha"

export * from "./src/browser"

const mocha = new Mocha()
// mocha.unloadFiles()

mocha.timeout(120 * 1000)

mocha.addFile(`./test/first.spec.ts`)
// mocha.fullTrace()

// mocha.run()
mocha.run((failures) => {
  if (failures > 0) {
    process.exit(1)
  }
  // process.on("exit", () => {
  //   process.exit(failures)
  // })
})

// TODO: make sure to clear files on reruns
// mocha.unloadFiles()
// TODO: parallelize tests, call before run
// mocha.parallelMode(true)
