"use strict";
const redis_1 = require("@appolo/redis");
const logger_1 = require("@appolo/logger");
module.exports = async function (app, env, moduleOptions) {
    if (!app.injector.getInstance("logger")) {
        await app.module.load(logger_1.LoggerModule);
    }
    if (moduleOptions.connection) {
        await app.module.use(redis_1.RedisModule.for({
            connection: moduleOptions.connection,
            fallbackConnections: moduleOptions.fallbackConnections
        }));
    }
};
//# sourceMappingURL=all.js.map