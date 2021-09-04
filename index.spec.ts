import test from 'tape';
import { MultiplexPromise } from './';
test('should multiplex promise execution', async t => {
    let executionsCount = 0;
    const longTask = () => {
        return new Promise<number>(resolve => {
            setTimeout(() => {
                for (let a = 0; a < 100; a++) { }
                executionsCount++;
                resolve(1);
            }, 100);
        });
    };
    const longTaskMultiplexed = new MultiplexPromise(longTask);
    let promises: Promise<any>[] = [];
    let resultCounter = 0;
    for (let i = 0; i < 10; i++) {
        promises.push(longTaskMultiplexed.run().then((result) => resultCounter += result));
    }
    await Promise.all(promises);
    t.equal(resultCounter, 10, 'results count is correct');
    t.equal(executionsCount, 1, 'single execution');
    t.end();
});
test('should propagate errors', async t => {
    let executionsCount = 0;
    const failure = () => {
        return new Promise<number>((_, reject) => {
            setTimeout(() => {
                executionsCount++;
                reject(new Error('failure'));
            }, 100);
        });
    };
    const failureMultiplexed = new MultiplexPromise(failure);
    let promises: Promise<any>[] = [];
    let errorCounter = 0;
    for (let i = 0; i < 10; i++) {
        promises.push(failureMultiplexed.run().catch((e: any) => {
            t.equal(e.message, 'failure', 'error message is correct');
            errorCounter++;
        }));
    }
    await Promise.all(promises);
    t.equal(errorCounter, 10, 'errors count is correct');
    t.equal(executionsCount, 1, 'single execution');
});