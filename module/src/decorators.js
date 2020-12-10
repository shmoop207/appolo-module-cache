"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cache = exports.CacheSymbol = void 0;
const utils_1 = require("@appolo/utils");
exports.CacheSymbol = Symbol("CacheSymbol");
function cache(options = {}) {
    return function (target, propertyKey, descriptor) {
        let data = utils_1.Reflector.getFnMetadata(exports.CacheSymbol, target.constructor, {});
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