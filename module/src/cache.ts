import {define, init, inject, lazy} from '@appolo/inject';
import {RedisProvider} from '@appolo/redis';
import {Cache as ACache} from "appolo-cache";
import {ILogger} from "@appolo/logger";
import {Numbers} from "@appolo/utils";
import {IInnerCacheOptions, IOptions} from "./IOptions";
import Timer = NodeJS.Timer;

const ResultSymbol = "@result";

@define()
export class Cache {

    @lazy() private redisProvider: RedisProvider;
    @inject() private moduleOptions: IOptions;
    @inject() private logger: ILogger;

    private _intervals = new Map<any, Timer>();

    private _cache: ACache<string, any>;

    private _promiseCache: Map<any, any> = new Map<any, any>();

    constructor(private _options: IInnerCacheOptions, private _valueFn?: Function, private _scope?: any) {

    }

    @init()
    private initialize() {
        this._cache = new ACache<string, any>(this._options);

        this._options.getMethod = this._options.peek ? "peek" : "get";

        if (this._options.refresh) {
            this._options.getMethod = this._options.peek ? "peekByExpire" : "getByExpire";
        }
    }

    public get<T>(...args: any[]): Promise<T> | T {

        let key = this._getKey(args);

        if (this._options.interval && !this._intervals.get(key)) {
            let interval = setInterval(this._refreshValue.bind(this, args, key), this._options.interval);

            this._intervals.set(key, interval)
        }

        return this._options.db ? this.getAsyncWithRedis(args, key) : this._getSync(args, key)
    }

    public async del(...args: any[]): Promise<void> {
        let key = this._getKey(args);

        this._cache.del(key);

        if (this._options.db) {

            let redisKey = this._getRedisKey(key);

            await this.redisProvider.del(redisKey);
        }
    }

    public set(value: any, ...args: any[]): void | Promise<void> {
        let key = this._getKey(args);

        this._setMemoryValue(key, value);
        if (this._options.db) {
            return this._setRedisValue(key, value);
        }
    }

    private _getSync(args: any[], key: string) {

        let item = this._getValueFromMemory(args, key);

        if (this._isValidItem(item)) {
            return this._options.isPromise ? Promise.resolve(item[ResultSymbol]) : item[ResultSymbol]
        }

        let result = this._getValue(args, key);

        return result
    }

    private _isValidItem(item: any): boolean {

        if (!item || !item.hasOwnProperty || !item.hasOwnProperty(ResultSymbol)) {
            return false
        }

        if (this._options.cacheNull) {
            return true;
        }

        let value = item[ResultSymbol];

        return value !== null && value !== undefined;

    }

    public async getAsyncWithRedis(args: any[], key: string) {

        let item: any = null;

        if (this._options.memory) {
            item = this._getValueFromMemory(args, key);

            if (this._isValidItem(item)) {
                return item[ResultSymbol];
            }
        }

        item = await this._getValueFromRedis(args, key);

        if (this._isValidItem(item)) {
            return item[ResultSymbol]
        }

        let result = this._getValue(args, key);

        return result
    }

    private _getKey(args: any[]) {

        if (this._options.resolver) {
            return this._options.resolver.apply(this._scope, args)
        }

        if (this._options.multi) {
            return JSON.stringify(args)
        }

        let arg = args[0] || "";

        return typeof arg == "object" ? JSON.stringify(arg) : arg
    }

    private _getValueFromMemory(args: any[], key: string) {

        let result = this._cache[this._options.getMethod](key, this._getMemoryMaxAge(), this._options.refreshTime);

        if (!result) {
            return null;
        }

        let value = this._needRefresh(result, args, key, !this._options.db);

        if (this._options.db && this._options.refresh && !result.validExpire) {
            this._getValueFromRedis(args, key).catch(e => this.logger.error(`failed to set redis cache ${key}`, {e}));
        }

        return this._options.clone ? JSON.parse(value) : value;
    }

    private async _getValueFromRedis(args: any[], key: string) {

        let redisKey = this._getRedisKey(key);
        let result: any;

        try {
            result = await (this._options.refresh && this._options.maxAge
                ? this.redisProvider.getByExpire(redisKey, this._getRedisMaxAge(), this._options.refreshTime)
                : this.redisProvider.get(redisKey));
        } catch (e) {
            this.logger.error(`failed to get redis cache ${key}`, {e})
        }

        if (!result) {
            return null;
        }

        let value = this._needRefresh(result, args, key);

        this._setMemoryValue(key, value);

        return value;
    }

    private _needRefresh(result: any, args: any[], key: string, refresh: boolean = true) {
        if (!this._options.refresh) {
            return result;
        }

        let value = result.value;

        if (!result.validExpire && refresh) {
            this._options.randomRefresh
                ? setTimeout(() => this._refreshValue(args, key), Numbers.random(this._options.randomRefresh))
                : this._refreshValue(args, key)
        }

        return value;
    }

    private _getRedisMaxAge(): number {
        let age = (this._options.dbMaxAge || this._options.maxAge);


        age = Math.floor(age / 1000);

        return age;
    }

    private _getMemoryMaxAge(): number {
        let age = this._options.maxAge

        return age
    }

    private _getRedisKey(key: any): string {
        if (typeof key != "string") {
            key = JSON.stringify(key);
        }

        key = key || "";

        if (this._options.dbKeyPrefix) {
            key = `${this._options.dbKeyPrefix}:${key}`
        }

        return key;
    }

    private _getValue(args: any[], key: any): Promise<any> | any {

        if (!this._valueFn) {
            return null
        }

        let promiseCached = this._promiseCache.get(key);

        if (promiseCached) {
            return promiseCached;
        }

        let result = this._valueFn.apply(this._scope, args);

        if (!result || !result.then || !result.catch) {
            this._setMemoryValue(key, result);
            return result;
        }

        this._options.isPromise = true;

        let value = result.then((data) => {

            this._setMemoryValue(key, data);
            this._setRedisValue(key, data);

            this._promiseCache.delete(key);

            return data;

        }).catch((e) => {
            this._promiseCache.delete(key);
            throw e;
        });

        this._promiseCache.set(key, value);


        return value
    }

    private _setMemoryValue(key: string, value: any) {
        if (!this._options.memory) {
            return;
        }

        let dto = value && value.hasOwnProperty && value.hasOwnProperty(ResultSymbol) ? value : {[ResultSymbol]: value};

        this._cache.set(key, this._options.clone ? JSON.stringify(dto) : dto, this._getMemoryMaxAge());
    }

    private _setRedisValue(key: string, value: any) {
        if (!this._options.db) {
            return;
        }
        let redisKey = this._getRedisKey(key), age = this._getRedisMaxAge();

        let dto = value && value.hasOwnProperty && value.hasOwnProperty(ResultSymbol) ? value : {[ResultSymbol]: value};

        return ((this._options.maxAge || this._options.dbMaxAge) ? this.redisProvider.setWithExpire(redisKey, dto, age) : this.redisProvider.set(redisKey, dto))
            .catch(e => this.logger.error(`failed to set redis cache ${key}`, {e}))

    }

    private _refreshValue(args: any[], key: any) {
        let value = this._getValue(args, key);
        Promise.resolve(value).catch((e) => this.logger.error(`failed to refresh cache ${key}`, {e}))
    }

    public get cache(): ACache<any, any> {
        return this._cache;
    }
}
