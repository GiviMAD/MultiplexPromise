"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiplexPromise = void 0;
var MultiplexPromise = /** @class */ (function () {
    function MultiplexPromise(op) {
        this.op = op;
        this.locked = false;
        this.awaiters = [];
    }
    MultiplexPromise.prototype.run = function () {
        var _this = this;
        if (!this.tryLock()) {
            return this.wait();
        }
        return new Promise(function (resolve, reject) { return _this.op()
            .then(function (result) {
            resolve(result);
            _this.unlock(undefined, result);
        })
            .catch(function (err) {
            reject(err);
            _this.unlock(err);
        }); });
    };
    MultiplexPromise.prototype.wait = function () {
        var _this = this;
        return new Promise(function (resolve, reject) { return _this.awaiters.push(function (err, data) { return data ? resolve(data) : reject(err); }); });
    };
    MultiplexPromise.prototype.tryLock = function () {
        return (this.locked) ? !this.locked : this.locked = true;
    };
    MultiplexPromise.prototype.unlock = function (err, data) {
        this.locked = false;
        this.awaiters
            .splice(0)
            .forEach(function (a) { return a(err, data); });
    };
    return MultiplexPromise;
}());
exports.MultiplexPromise = MultiplexPromise;
