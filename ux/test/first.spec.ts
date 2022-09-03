import assert from "assert";
import { describe } from "mocha";

const wait = async (): Promise<boolean> =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true)
    }, 1000)
  })


describe("TEST", () => {
  it("is true", async () => {
    const result = await wait()
    assert(result)
  })
})
