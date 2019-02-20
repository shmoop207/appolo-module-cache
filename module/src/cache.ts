import {define, initMethod, inject, injectLazy} from 'appolo';
import {RedisProvider} from '@appolo/redis';
import {Cache as ACache} from "appolo-cache";
import {ILogger} from "@appolo/logger";
import {IInnerCacheOptions, IOptions} from "./IOptions";
import Timer = NodeJS.Timer;


@define()
export class Cache {

    @injectLazy() private redisProvider: RedisProvider;
    @inject() private moduleOptions: IOptions;
    @inject() private logger: ILogger;

    private _intervals = new Map<any, Timer>();

    private _cache: ACache<string, any>;

    constructor(private _options: IInnerCacheOptions, private _valueFn: Function, private _scope?: any) {

    }

    @initMethod()
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

    private _getSync(args: any[], key: string) {

        let item = this._getValueFromMemory(args, key);

        if (item) {
            return this._options.isPromise ? Promise.resolve(item) : item
        }

        let result = this._getValue(args, key);

        return result
    }

    public async getAsyncWithRedis(args: any[], key: string) {

        let item: any = null;

        if (this._options.memory) {
            item = this._getValueFromMemory(args, key);

            if (item) {
                return item
            }
        }

        item = await this._getValueFromRedis(args, key);

        if (item) {
            return item
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

        let result = this._cache[this._options.getMethod](key);

        if (!result) {
            return null;
        }

        let value = this._needRefresh(result, args, key);

        return this._options.clone ? JSON.parse(value) : value;
    }

    private async _getValueFromRedis(args: any[], key: string) {

        let redisKey = this._getRedisKey(key);
        let result: any;

        try {
            result = await (this._options.refresh && this._options.maxAge
                ? this.redisProvider.getByExpire(redisKey, this._getRedisMaxAge())
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

    private _needRefresh(result: any, args: any[], key: string) {
        if (!this._options.refresh) {
            return result;
        }

        let value = result.value;

        if (!result.validExpire) {
            this._refreshValue(args, key)
        }

        return value;
    }

    private _getRedisMaxAge(): number {
        return Math.floor((this._options.dbMaxAge || this._options.maxAge) / 1000)
    }

    private _getRedisKey(key: any): string {
        if (typeof key != "string") {
            key = JSON.stringify(key);
        }

        return `${this._options.keyPrefix || ""}:${key || ""}`
    }

    private _getValue(args: any[], key: any): Promise<any> | any {

        let result = this._valueFn.apply(this._scope, args);

        if (!result || !result.then || !result.catch) {
            this._setMemoryValue(key, result);
            return result;
        }

        this._options.isPromise = true;

        let value = result.then((data) => {

            this._setMemoryValue(key, data);
            this._setRedisValue(key, data);

            return data
        });

        return value
    }

    private _setMemoryValue(key: string, value: any) {
        if (!this._options.memory) {
            return;
        }

        this._cache.set(key, this._options.clone ? JSON.stringify(value) : value, this._options.maxAge);
    }

    private _setRedisValue(key: string, value: any) {
        if (!this._options.db) {
            return;
        }
        let redisKey = this._getRedisKey(key), age = this._getRedisMaxAge();

        (this._options.maxAge ? this.redisProvider.setWithExpire(redisKey, value, age) : this.redisProvider.set(redisKey, value))
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