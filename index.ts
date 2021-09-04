export class MultiplexPromise<T = void> {
    private locked = false;
    private awaiters: ((err: Error | undefined, data: T | undefined) => void)[] = [];
    constructor(private op: () => Promise<T>) { }
    run(): Promise<T> {
        if (!this.tryLock()) {
            return this.wait();
        }
        return new Promise<T>((resolve, reject) => this.op()
            .then(result => {
                resolve(result);
                this.unlock(undefined, result);
            })
            .catch(err => {
                reject(err);
                this.unlock(err);
            }));
    }
    private wait() {
        return new Promise<T>((resolve, reject) => this.awaiters.push((err, data) => data ? resolve(data) : reject(err)));
    }
    private tryLock() {
        return (this.locked) ? !this.locked : this.locked = true;
    }
    private unlock(err: undefined, data: T): void;
    private unlock(err: Error): void;
    private unlock(err?: Error, data?: T) {
        this.locked = false;
        this.awaiters
            .splice(0)
            .forEach(a => a(err, data));
    }
}
