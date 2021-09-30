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
                awaiters.unshift(function (err, data) { return data ? resolve(data) : reject(err); });
                return awaiters;
            };
            _this.op()
                .then(function (result) {
                resolve(result);
                _this.unlock(getAwaiters(), undefined, result);
            })
                .catch(function (err) {
                reject(err);
                _this.unlock(getAwaiters(), err);
            });
        });
    };
    MultiplexPromise.prototype.wait = function () {
        var _this = this;
        return new Promise(function (resolve, reject) { return _this.awaiters.push(function (err, data) { return data ? resolve(data) : reject(err); }); });
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
