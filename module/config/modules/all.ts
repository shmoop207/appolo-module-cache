import {App} from 'appolo';

import {RedisModule} from '@appolo/redis';
import {LoggerModule} from '@appolo/logger';
import {IEnv} from "../env/IEnv";
import {IOptions} from "../../src/IOptions";


export = async function (app: App, env: IEnv, moduleOptions: IOptions) {

    if (!app.injector.getInstance("logger")) {
        await app.module(LoggerModule)
    }

    if (moduleOptions.connection) {
        await app.module(new RedisModule({
            connection: moduleOptions.connection,
        }));
    }


}
