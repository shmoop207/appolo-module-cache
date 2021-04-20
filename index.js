"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = exports.CacheProvider = exports.cache = exports.CacheModule = void 0;
const decorators_1 = require("./module/src/decorators");
Object.defineProperty(exports, "cache", { enumerable: true, get: function () { return decorators_1.cache; } });
const cacheProvider_1 = require("./module/src/cacheProvider");
Object.defineProperty(exports, "CacheProvider", { enumerable: true, get: function () { return cacheProvider_1.CacheProvider; } });
const cacheModule_1 = require("./module/cacheModule");
Object.defineProperty(exports, "CacheModule", { enumerable: true, get: function () { return cacheModule_1.CacheModule; } });
const cache_1 = require("./module/src/cache");
Object.defineProperty(exports, "Cache", { enumerable: true, get: function () { return cache_1.Cache; } });
//# sourceMappingURL=index.js.map