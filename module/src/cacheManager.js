"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("appolo/index");
const cache_1 = require("./cache");
const _ = require("lodash");
let CacheManager = class CacheManager {
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
], CacheManager.prototype, "createCacheInstance", void 0);
tslib_1.__decorate([
    index_1.inject()
], CacheManager.prototype, "moduleOptions", void 0);
CacheManager = tslib_1.__decorate([
    index_1.define(),
    index_1.singleton()
], CacheManager);
exports.CacheManager = CacheManager;
//# sourceMappingURL=cacheManager.js.map