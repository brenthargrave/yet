import { Observable } from "rxjs";
import Mocha from "mocha"

export * from "./src/browser"

const mocha = new Mocha()

mocha.addFile(`./test/first.spec.ts`);

const run = mocha.run((failures) => {
  process.on('exit', () => {
    process.exit(failures)
  });
});

// TODO: make sure to clear files on reruns
// mocha.unloadFiles()
// TODO: parallelize tests, call before run
// mocha.parallelMode(true)

