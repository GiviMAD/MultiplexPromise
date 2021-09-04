# MultiplexPromise
## Multiplex a Promise execution
This module is intended to wait for the same promise result in different parallels executions. 

As an example it could be used to wait for a token renew inside an axios interceptor.

Be aware that if your promise returns a non primitive value all the awaiters will get the same reference so clone it if you need to modify it.

Quick example:
```js
async function meassureExecution(op: () => Promise<any>) {
    var hrstart = process.hrtime()
    var start = new Date()
    await op();
    var end = new Date().getTime() - start.getTime();
    const hrend = process.hrtime(hrstart);
    console.info('Execution time: %dms', end)
    console.log('Execution time (hr): %dms', (hrend[0] * 1000) + (hrend[1] / 1000000))
}
export async function testMultiplex() {
    let executionsCount = 0;
    const longTask = () => {
        return new Promise<number>(resolve => {
            setTimeout(() => {
                for (let a = 0; a < 100000000; a++) { }
                executionsCount++;
                resolve(1);
            }, 100);
        });
    }
    const longTaskMultiplexed = new MultiplexPromise(longTask);
    let promises: Promise<any>[] = [];
    let resultCounter = 0;
    for (let i = 0; i < 10; i++) {
        promises.push(longTask().then(() => resultCounter++));
    }
    console.log('No Multiplex')
    await meassureExecution(() => Promise.all(promises));
    console.log('Executions: ' + executionsCount);
    console.log('Results count: ' + resultCounter);
    resultCounter = 0;
    executionsCount = 0;
    promises = [];
    for (let i = 0; i < 10; i++) {
        promises.push(longTaskMultiplexed.run().then(() => resultCounter++));
    }
    console.log('Multiplex')
    await meassureExecution(() => Promise.all(promises));
    console.log('Executions: ' + executionsCount);
    console.log('Results count: ' + resultCounter);
}
```
Fn testMultiplex outputs:
```sh
No Multiplex
Execution time: 747ms
Execution time (hr): 746.136796ms
Executions: 10
Results count: 10
Multiplex
Execution time: 165ms
Execution time (hr): 165.597155ms
Executions: 1
Results count: 10
```