"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("appolo/index");
const cache_1 = require("./cache");
const _ = require("lodash");
let CacheProvider = class CacheProvider {
    constructor() {
        this._caches = new Map();
    }
    createCache(options, valueFn, scope) {
        let defaultOptions = _.pick(this.moduleOptions, ["memory", "maxSize", "keyPrefix"]);
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
        return cache;
    }
    getCacheById(id) {
        return this._caches.get(id);
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