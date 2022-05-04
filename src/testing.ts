type UnitTest<T> = {
    desc: string,
    testFunc: (env: T) => void
}

export abstract class TestSuite {
    constructor(
        public desc: string,
        private counter: number = 0
        ) { }

    setup() { }
    teardown() { }

    runTests(...tests: UnitTest<typeof this>[]) {
        console.log(`--- ${this.desc} ---`)
        for (let t of tests) {
            this.counter += 1
            try {
                (() => {
                    this.setup()
                    t.testFunc(this)
                    this.teardown()
                })()
                console.log(`\u001b[32m✔ Test No. ${this.counter}: ${t.desc}\u001b[0m`)
            } catch (e) {
                console.log(`\u001b[31m✗ Test No. ${this.counter}: ${t.desc}\u001b[0m - Error:\n`, e)
                return
            }
        }
    }
}

export function testCase<T>(desc: string, testFunc: (env: T) => void) {
    return { desc, testFunc }
}
