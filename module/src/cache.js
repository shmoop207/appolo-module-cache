"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_1 = require("appolo");
const appolo_cache_1 = require("appolo-cache");
let Cache = class Cache {
    constructor(_options, _valueFn, _scope) {
        this._options = _options;
        this._valueFn = _valueFn;
        this._scope = _scope;
        this._intervals = new Map();
    }
    initialize() {
        this._cache = new appolo_cache_1.Cache(this._options);
        this._options.getMethod = this._options.peek ? "peek" : "get";
        if (this._options.refresh) {
            this._options.getMethod = this._options.peek ? "peekByExpire" : "getByExpire";
        }
    }
    get(...args) {
        let key = this._getKey(args);
        if (this._options.interval && !this._intervals.get(key)) {
            let interval = setInterval(this._refreshValue.bind(this, args, key), this._options.interval);
            this._intervals.set(key, interval);
        }
        return this._options.db ? this.getAsyncWithRedis(args, key) : this._getSync(args, key);
    }
    _getSync(args, key) {
        let item = this._getValueFromMemory(args, key);
        if (item) {
            return this._options.isPromise ? Promise.resolve(item) : item;
        }
        let result = this._getValue(args, key);
        return result;
    }
    async getAsyncWithRedis(args, key) {
        let item = null;
        if (this._options.memory) {
            item = this._getValueFromMemory(args, key);
            if (item) {
                return item;
            }
        }
        item = await this._getValueFromRedis(args, key);
        if (item) {
            return item;
        }
        let result = this._getValue(args, key);
        return result;
    }
    _getKey(args) {
        if (this._options.resolver) {
            return this._options.resolver.apply(this._scope, args);
        }
        if (this._options.multi) {
            return JSON.stringify(args);
        }
        let arg = args[0] || "";
        return typeof arg == "object" ? JSON.stringify(arg) : arg;
    }
    _getValueFromMemory(args, key) {
        let result = this._cache[this._options.getMethod](key);
        if (!result) {
            return null;
        }
        let value = this._needRefresh(result, args, key);
        return this._options.clone ? JSON.parse(value) : value;
    }
    async _getValueFromRedis(args, key) {
        let redisKey = this._getRedisKey(key);
        let result;
        try {
            result = await (this._options.refresh && this._options.maxAge
                ? this.redisProvider.getByExpire(redisKey, this._getRedisMaxAge())
                : this.redisProvider.get(redisKey));
        }
        catch (e) {
            this.logger.error(`failed to get redis cache ${key}`, { e });
        }
        if (!result) {
            return null;
        }
        let value = this._needRefresh(result, args, key);
        this._setMemoryValue(key, value);
        return value;
    }
    _needRefresh(result, args, key) {
        if (!this._options.refresh) {
            return result;
        }
        let value = result.value;
        if (!result.validExpire) {
            this._refreshValue(args, key);
        }
        return value;
    }
    _getRedisMaxAge() {
        return Math.floor((this._options.dbMaxAge || this._options.maxAge) / 1000);
    }
    _getRedisKey(key) {
        if (typeof key != "string") {
            key = JSON.stringify(key);
        }
        return `${this._options.keyPrefix || ""}:${key || ""}`;
    }
    _getValue(args, key) {
        let result = this._valueFn.apply(this._scope, args);
        if (!result || !result.then || !result.catch) {
            this._setMemoryValue(key, result);
            return result;
        }
        this._options.isPromise = true;
        let value = result.then((data) => {
            this._setMemoryValue(key, data);
            this._setRedisValue(key, data);
            return data;
        });
        return value;
    }
    _setMemoryValue(key, value) {
        if (!this._options.memory) {
            return;
        }
        this._cache.set(key, this._options.clone ? JSON.stringify(value) : value, this._options.maxAge);
    }
    _setRedisValue(key, value) {
        if (!this._options.db) {
            return;
        }
        let redisKey = this._getRedisKey(key), age = this._getRedisMaxAge();
        (this._options.maxAge ? this.redisProvider.setWithExpire(redisKey, value, age) : this.redisProvider.set(redisKey, value))
            .catch(e => this.logger.error(`failed to set redis cache ${key}`, { e }));
    }
    _refreshValue(args, key) {
        let value = this._getValue(args, key);
        Promise.resolve(value).catch((e) => this.logger.error(`failed to refresh cache ${key}`, { e }));
    }
    get cache() {
        return this._cache;
    }
};
tslib_1.__decorate([
    appolo_1.injectLazy()
], Cache.prototype, "redisProvider", void 0);
tslib_1.__decorate([
    appolo_1.inject()
], Cache.prototype, "moduleOptions", void 0);
tslib_1.__decorate([
    appolo_1.inject()
], Cache.prototype, "logger", void 0);
tslib_1.__decorate([
    appolo_1.initMethod()
], Cache.prototype, "initialize", null);
Cache = tslib_1.__decorate([
    appolo_1.define()
], Cache);
exports.Cache = Cache;
//# sourceMappingURL=cache.js.map