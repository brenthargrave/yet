import { Observable } from "rxjs";
import Mocha from "mocha"

const mocha = new Mocha()

mocha.addFile(`./test/first.spec.ts`);

const run = mocha.run((failures) => {
  process.on('exit', () => {
    process.exit(failures)
  });
});

// TODO: make sure to clear files on reruns
// mocha.unloadFiles()

console.log("Hello, world!")

