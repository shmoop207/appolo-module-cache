import {define, inject, factoryMethod, singleton} from "@appolo/inject";
import {Cache} from "./cache";
import {ICacheOptions, IOptions} from "./IOptions";
import * as _ from "lodash";

@define()
@singleton()
export class CacheProvider {

    @factoryMethod(Cache) private createCacheInstance: (options: ICacheOptions, valueFn: Function, scope?: any) => Cache;
    @inject() private moduleOptions: IOptions;

    private _caches: Map<string, Cache> = new Map();
    private _cachesByScope: Map<any, Map<string, Cache>> = new Map();


    public createCache(options: ICacheOptions, valueFn: Function, scope?: any, propertyName?: string): Cache {

        let defaultOptions: ICacheOptions = _.pick(this.moduleOptions, ["memory", "db", "maxSize", "keyPrefix", "maxAge", "dbMaxAge", "refresh","cacheNull"]);

        let ops = _.defaults({}, options, defaultOptions);

        if (ops.db) {
            ops.dbKeyPrefix = ops.dbKeyPrefix || `c:${scope && scope.constructor ? scope.constructor.name : ""}:${valueFn.name}`;
        }

        if (!ops.id) {
            ops.id = `${scope && scope.constructor ? scope.constructor.name : ""}_${valueFn.name}`;
        }


        let cache = this.createCacheInstance(ops, valueFn, scope);

        if (ops.id) {
            this._caches.set(ops.id, cache);
        }

        if (scope && propertyName) {
            let map = this._cachesByScope.get(scope);

            if (!map) {
                map = new Map<string, Cache>();
                this._cachesByScope.set(scope, map);
            }

            map.set(propertyName, cache);
        }

        return cache
    }

    public getCacheById(id: string): Cache {
        return this._caches.get(id);
    }

    public getAllCaches(): Cache[] {
        return [...this._caches.values()];
    }

    public getCacheByScope(fn: any): Map<string, Cache> {
        return this._cachesByScope.get(fn);
    }

    public getCacheByScopeAndProperty(fn: any, property: string): Cache {
        let map = this._cachesByScope.get(fn);

        if (!map) {
            return null;
        }

        return map.get(property)
    }

}
