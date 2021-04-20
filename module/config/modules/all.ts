import {App} from '@appolo/engine';

import {RedisModule} from '@appolo/redis';
import {LoggerModule} from '@appolo/logger';
import {IEnv} from "../env/IEnv";
import {IOptions} from "../../src/IOptions";

export = async function (app: App, env: IEnv, moduleOptions: IOptions) {

    if (!app.injector.getInstance("logger")) {
        await app.module.load(LoggerModule)
    }

    if (moduleOptions.connection) {
        await app.module.use(RedisModule.for({
            connection: moduleOptions.connection,
            fallbackConnections: moduleOptions.fallbackConnections
        }));
    }


}
