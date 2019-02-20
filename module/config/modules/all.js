"use strict";
const redis_1 = require("@appolo/redis");
const logger_1 = require("@appolo/logger");
module.exports = async function (app, env, moduleOptions) {
    if (!app.injector.getInstance("logger")) {
        await app.module(logger_1.LoggerModule);
    }
    if (moduleOptions.connection) {
        await app.module(new redis_1.RedisModule({
            connection: moduleOptions.connection,
        }));
    }
};
//# sourceMappingURL=all.js.map