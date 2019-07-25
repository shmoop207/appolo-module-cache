"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("appolo/index");
const cache_1 = require("./cache");
const _ = require("lodash");
let CacheProvider = class CacheProvider {
    constructor() {
        this._caches = new Map();
        this._cachesByScope = new Map();
    }
    createCache(options, valueFn, scope, propertyName) {
        let defaultOptions = _.pick(this.moduleOptions, ["memory", "db", "maxSize", "keyPrefix", "maxAge", "dbMaxAge", "refresh"]);
        let ops = _.defaults({}, options, defaultOptions);
        if (ops.db) {
            ops.keyPrefix = `${ops.keyPrefix}:${scope && scope.constructor ? scope.constructor.name : ""}:${valueFn.name}`;
        }
        if (!ops.id) {
            ops.id = `${scope && scope.constructor ? scope.constructor.name : ""}_${valueFn.name}`;
        }
        let cache = this.createCacheInstance(ops, valueFn, scope);
        if (ops.id) {
            this._caches.set(ops.id, cache);
        }
        if (scope && propertyName) {
            let map = this._cachesByScope.get(scope);
            if (!map) {
                map = new Map();
                this._cachesByScope.set(scope, map);
            }
            map.set(propertyName, cache);
        }
        return cache;
    }
    getCacheById(id) {
        return this._caches.get(id);
    }
    getAllCaches() {
        return [...this._caches.values()];
    }
    getCacheByScope(fn) {
        return this._cachesByScope.get(fn);
    }
    getCacheByScopeAndProperty(fn, property) {
        let map = this._cachesByScope.get(fn);
        if (!map) {
            return null;
        }
        return map.get(property);
    }
};
tslib_1.__decorate([
    index_1.injectFactoryMethod(cache_1.Cache)
], CacheProvider.prototype, "createCacheInstance", void 0);
tslib_1.__decorate([
    index_1.inject()
], CacheProvider.prototype, "moduleOptions", void 0);
CacheProvider = tslib_1.__decorate([
    index_1.define(),
    index_1.singleton()
], CacheProvider);
exports.CacheProvider = CacheProvider;
//# sourceMappingURL=cacheProvider.js.map