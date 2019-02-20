"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appolo_1 = require("appolo");
exports.CacheSymbol = Symbol("CacheSymbol");
function cache(options = {}) {
    return function (target, propertyKey, descriptor) {
        let data = appolo_1.Util.getReflectData(exports.CacheSymbol, target.constructor, {});
        if (!data[propertyKey]) {
            data[propertyKey] = {
                options: options,
                propertyKey,
                descriptor
            };
        }
    };
}
exports.cache = cache;
//# sourceMappingURL=decorators.js.map