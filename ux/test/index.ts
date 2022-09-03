import { Observable } from "rxjs";
import Mocha from "mocha"

const mocha = new Mocha()

mocha.addFile(`./test/first.spec.ts`);

mocha.run((failures) => {
  process.on('exit', () => {
    process.exit(failures)
  });
});

console.log("Hello, world!")

