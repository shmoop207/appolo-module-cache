"use strict";
var CacheModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheModule = void 0;
const tslib_1 = require("tslib");
const engine_1 = require("@appolo/engine");
const utils_1 = require("@appolo/utils");
const decorators_1 = require("./src/decorators");
const cacheProvider_1 = require("./src/cacheProvider");
let CacheModule = CacheModule_1 = class CacheModule extends engine_1.Module {
    constructor() {
        super(...arguments);
        this.Defaults = {
            id: "cacheProvider",
            memory: true,
            maxSize: 1000,
            keyPrefix: "c",
            cacheNull: false
        };
    }
    static for(options) {
        return { type: CacheModule_1, options };
    }
    get exports() {
        return [{ id: this.moduleOptions.id, type: cacheProvider_1.CacheProvider }];
    }
    beforeModuleInitialize() {
        let meta = this.app.tree.parent.discovery.findAllReflectData(decorators_1.CacheSymbol);
        meta.forEach((item => this._createCacheActions(item)));
    }
    _createCacheActions(item) {
        utils_1.Arrays.forEach(item.metaData, meta => this._createCacheAction(item.fn, meta));
    }
    _createCacheAction(fn, meta) {
        let old = fn.prototype[meta.propertyKey], $self = this;
        fn.prototype[meta.propertyKey] = function () {
            let cacheProvider = $self.app.injector.get(cacheProvider_1.CacheProvider);
            let cache = cacheProvider.getCacheByScopeAndProperty(this, meta.propertyKey);
            if (!cache) {
                cache = cacheProvider.createCache(meta.options, old, this, meta.propertyKey);
            }
            return cache.get.apply(cache, arguments);
        };
    }
};
CacheModule = CacheModule_1 = tslib_1.__decorate([
    (0, engine_1.module)()
], CacheModule);
exports.CacheModule = CacheModule;
//# sourceMappingURL=cacheModule.js.map