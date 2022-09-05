import { Observable } from "rxjs";
import Mocha from "mocha"

export * from "./src/browser"

const mocha = new Mocha()
// mocha.unloadFiles()

mocha.timeout(1000 * 30)



mocha.addFile(`./test/first.spec.ts`);
// mocha.fullTrace()

const run = mocha.run((failures) => {
  process.on('exit', () => {
    process.exit(failures)
  });
});

// TODO: make sure to clear files on reruns
// mocha.unloadFiles()
// TODO: parallelize tests, call before run
// mocha.parallelMode(true)

