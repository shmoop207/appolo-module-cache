"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheProvider = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
const cache_1 = require("./cache");
const utils_1 = require("@appolo/utils");
let CacheProvider = class CacheProvider {
    constructor() {
        this._caches = new Map();
        this._cachesByScope = new Map();
    }
    createCache(options, valueFn, scope, propertyName) {
        let defaultOptions = utils_1.Objects.pick(this.moduleOptions, "memory", "db", "maxSize", "keyPrefix", "maxAge", "dbMaxAge", "refresh", "cacheNull");
        let ops = utils_1.Objects.defaults({}, options, defaultOptions);
        if (ops.db) {
            ops.dbKeyPrefix = ops.dbKeyPrefix || `c:${scope && scope.constructor ? scope.constructor.name : ""}:${valueFn ? valueFn.name : utils_1.Guid.guid()}`;
        }
        if (!ops.id) {
            ops.id = `${scope && scope.constructor ? scope.constructor.name : ""}_${valueFn ? valueFn.name : utils_1.Guid.guid()}`;
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
    (0, inject_1.factoryMethod)(cache_1.Cache)
], CacheProvider.prototype, "createCacheInstance", void 0);
tslib_1.__decorate([
    (0, inject_1.inject)()
], CacheProvider.prototype, "moduleOptions", void 0);
CacheProvider = tslib_1.__decorate([
    (0, inject_1.define)(),
    (0, inject_1.singleton)()
], CacheProvider);
exports.CacheProvider = CacheProvider;
//# sourceMappingURL=cacheProvider.js.map