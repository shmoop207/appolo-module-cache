import {define, inject, injectFactoryMethod, singleton} from "appolo/index";
import {Cache} from "./cache";
import {ICacheOptions, IOptions} from "./IOptions";
import * as _ from "lodash";

@define()
@singleton()
export class CacheManager {

    @injectFactoryMethod(Cache) private createCacheInstance: (options: ICacheOptions, valueFn: Function, scope?: any) => Cache;
    @inject() private moduleOptions: IOptions;

    private _caches: Map<string, Cache> = new Map();


    public createCache(options: ICacheOptions, valueFn: Function, scope?: any): Cache {

        let defaultOptions: ICacheOptions = _.pick(this.moduleOptions, ["memory", "maxSize", "keyPrefix"]);

        let ops = _.defaults({}, options, defaultOptions);

        if (ops.db) {
            ops.keyPrefix = `${ops.keyPrefix}:${scope && scope.constructor ? scope.constructor.name : ""}:${valueFn.name}`;
        }

        if (!ops.id) {
            ops.id = `${scope && scope.constructor ? scope.constructor.name : ""}_${valueFn.name}`;
        }


        let cache = this.createCacheInstance(ops, valueFn, scope)

        if (ops.id) {
            this._caches.set(ops.id, cache)
        }

        return cache
    }

    public getCacheById(id: string): Cache {
        return this._caches.get(id);
    }

}