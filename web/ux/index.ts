import Mocha from "mocha"

export * from "./src/browser"

const mocha = new Mocha()
// mocha.unloadFiles()

mocha.timeout(1000 * 30)

mocha.addFile(`./test/first.spec.ts`)
// mocha.fullTrace()

// mocha.run((failures) => {
//   process.on("exit", () => {
//     process.exit(failures)
//   })
// })
mocha.run()

// TODO: make sure to clear files on reruns
// mocha.unloadFiles()
// TODO: parallelize tests, call before run
// mocha.parallelMode(true)
