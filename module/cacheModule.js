"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_1 = require("appolo");
const _ = require("lodash");
const decorators_1 = require("./src/decorators");
const cacheManager_1 = require("./src/cacheManager");
let CacheModule = class CacheModule extends appolo_1.Module {
    constructor(options) {
        super(options);
        this.Defaults = {
            memory: true,
            maxSize: 1000,
            keyPrefix: "c"
        };
    }
    get exports() {
        return [];
    }
    beforeInitialize() {
        let meta = appolo_1.Util.findAllReflectData(decorators_1.CacheSymbol, this.app.parent.exported);
        _.forEach(meta, (item => this._createCacheActions(item)));
    }
    _createCacheActions(item) {
        _.forEach(item.metaData, meta => this._createCacheAction(item.fn, meta));
    }
    async _createCacheAction(fn, meta) {
        let old = fn.prototype[meta.propertyKey];
        let $self = this, cache;
        fn.prototype[meta.propertyKey] = async function () {
            if (!cache) {
                let cacheManager = $self.app.injector.get(cacheManager_1.CacheManager);
                cache = cacheManager.createCache(meta.options, old, this);
            }
            return cache.get(...arguments);
        };
    }
};
CacheModule = tslib_1.__decorate([
    appolo_1.module()
], CacheModule);
exports.CacheModule = CacheModule;
//# sourceMappingURL=cacheModule.js.map