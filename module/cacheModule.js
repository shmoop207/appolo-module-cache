"use strict";
var CacheModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_1 = require("appolo");
const _ = require("lodash");
const decorators_1 = require("./src/decorators");
const cacheProvider_1 = require("./src/cacheProvider");
let CacheModule = CacheModule_1 = class CacheModule extends appolo_1.Module {
    constructor(options) {
        super(options);
        this.Defaults = {
            id: "cacheProvider",
            memory: true,
            maxSize: 1000,
            keyPrefix: "c",
            cacheNull: true
        };
    }
    static for(options) {
        return new CacheModule_1(options);
    }
    get exports() {
        return [{ id: this.moduleOptions.id, type: cacheProvider_1.CacheProvider }];
    }
    beforeInitialize() {
        let meta = appolo_1.Util.findAllReflectData(decorators_1.CacheSymbol, this.app.parent.exported);
        _.forEach(meta, (item => this._createCacheActions(item)));
    }
    _createCacheActions(item) {
        _.forEach(item.metaData, meta => this._createCacheAction(item.fn, meta));
    }
    async _createCacheAction(fn, meta) {
        let old = fn.prototype[meta.propertyKey], $self = this;
        fn.prototype[meta.propertyKey] = async function () {
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
    appolo_1.module()
], CacheModule);
exports.CacheModule = CacheModule;
//# sourceMappingURL=cacheModule.js.map