type Awaiter<T> = (err: Error | undefined, data: T | undefined) => void;

export class MultiplexPromise<T = void> {
    private locked = false;
    private awaiters: (Awaiter<T>)[] = [];
    constructor(private op: () => Promise<T>) { }
    run(): Promise<T> {
        if (!this.tryLock()) {
            return this.wait();
        }
        return new Promise<T>((resolve, reject) => {
            const getAwaiters = () => {
                const awaiters = this.awaiters.splice(0);
                awaiters.unshift(this.getAwaiter(resolve, reject));
                return awaiters;
            }
            this.op()
                .then(result => {
                    this.unlock(getAwaiters(), undefined, result);
                })
                .catch(err => {
                    this.unlock(getAwaiters(), err);
                })
        });
    }
    private getAwaiter(resolve: (value: T) => void, reject: (reason?: any) => void): Awaiter<T> {
        return (err, data) => err ? reject(err) : resolve(data as T);
    }
    private wait() {
        return new Promise<T>((resolve, reject) => this.awaiters.push(this.getAwaiter(resolve, reject)));
    }
    private tryLock() {
        return (this.locked) ? !this.locked : this.locked = true;
    }
    private unlock(awaiters: Awaiter<T>[], err: undefined, data: T): void;
    private unlock(awaiters: Awaiter<T>[], err: Error): void;
    private unlock(awaiters: Awaiter<T>[], err?: Error, data?: T) {
        this.locked = false;
        awaiters.forEach(a => a(err, data));
    }
}
