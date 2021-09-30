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
        return new Promise(function (resolve, reject) {
            var getAwaiters = function () {
                var awaiters = _this.awaiters.splice(0);
                awaiters.unshift(_this.getAwaiter(resolve, reject));
                return awaiters;
            };
            _this.op()
                .then(function (result) {
                _this.unlock(getAwaiters(), undefined, result);
            })
                .catch(function (err) {
                _this.unlock(getAwaiters(), err);
            });
        });
    };
    MultiplexPromise.prototype.getAwaiter = function (resolve, reject) {
        return function (err, data) { return !err ? reject(err) : resolve(data); };
    };
    MultiplexPromise.prototype.wait = function () {
        var _this = this;
        return new Promise(function (resolve, reject) { return _this.awaiters.push(_this.getAwaiter(resolve, reject)); });
    };
    MultiplexPromise.prototype.tryLock = function () {
        return (this.locked) ? !this.locked : this.locked = true;
    };
    MultiplexPromise.prototype.unlock = function (awaiters, err, data) {
        this.locked = false;
        awaiters.forEach(function (a) { return a(err, data); });
    };
    return MultiplexPromise;
}());
exports.MultiplexPromise = MultiplexPromise;
