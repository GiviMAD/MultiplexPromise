export declare class MultiplexPromise<T = void> {
    private op;
    private locked;
    private awaiters;
    constructor(op: () => Promise<T>);
    run(): Promise<T>;
    private wait;
    private tryLock;
    private unlock;
}
