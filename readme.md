Cache module for [`appolo`](https://github.com/shmoop207/appolo).

Cache methods results using [`appolo-cache​`](https://github.com/shmoop207/appolo-cache) with optional redis store

## Installation

```javascript
npm i @appolo/cache
```

## Options
| key | Description | Type | Default
| --- | --- | --- | --- |
| `id` | cacheProvider injector id  | `string`|  `cacheProvider`|
| `connection` | redis connection string  | `string`|  ``|
| `memory` | true to use memory store  | `boolean`|  `true`|
| `db` | true to use redis store  | `boolean`|  `false`|
| `maxSize` | max memory store items  | `number`|  `1000`|
| `keyPrefix` | redis prefix key  | `string`|  `c`|

all option are optional and will be added as defaults to cache options
in config/modules/all.ts

```javascript
import {CacheModule} from '@appolo/cache';

export = async function (app: App) {
    await app.module(new CacheModule({maxSize:100}));

   // or with redis store
   await app.module(new CacheModule({db:true,connection:"redis://redis-connection-string"}));

}
```


## Cache Options

| key | Description | Type | Default
| --- | --- | --- | --- |
| `id` | custom cache id | `string`|  `className_methodName`|
| `maxSize` | max cache size | `number`|  `1000`|
| `maxAge` | set maximum age in ms of all cache items | `number` | `unlimited` |
| `clone` |  clone the cache result | `boolean` | `false` |
| `interval` | set cache refresh interval in ms | `number` | `undefined` |
| `resolver` | function to get the cache key by default the first argument will be used as the cache key. | `function` | `undefined` |
| `multi` | if no resolver defined use all the arguments as key else use the first argument as key  | `boolean` | `false` |
| `peek` |  use peek method instead of get | `boolean` | `false` |
| `refresh` |  refresh cache on half maxAge expire | `boolean` | `false` |
| `keyPrefix` | redis prefix key  | `string`|  `c`|
| `memory` | true to use memory store  | `boolean`|  `true`|
| `db` | true to use redis store  | `boolean`|  `false`|
| `dbMaxAge` | set maximum age in ms of all cache items in db if not defined maxAge will be used  | `number` | `unlimited` |


## Usage
```javascript
import { cache,define } from 'appolo';

@define()
export class SomeClass {
    private counter = 0;

    @cache()
    method() {
       return ++this.counter
    }

    // will be refreshed every 5 sec
    @cache({interval:5000})
    async method2(key:string) {
        let result = await doSomeThingAsync(key)
        return result;
    }

     // will try to get items from memroy with expire
     // of 1 minute then from redis with expire of one hour
    @cache({db:true,maxAge:60*1000,:dbMaxAge:60*1000*60})
        async method2(key:string) {
            let result = await doSomeThingAsync(key)
            return result;
        }
}

```

## CacheProvider
### `createCache(options: ICacheOptions, valueFn: Function, scope?: any)`
create new cache wrapper
- options - cache options
- valueFn - value function will be called to get the value
- scope - scope of the value function

### `getCacheById(id:string):Cache`
return cache wrapper by id

## Cache
cache wrapper instance

### `get<T>(...args: any[]): Promise<T> | T`
get value from cache if not found the value fn will be called
### `get cache`
return [`appolo-cache​`](https://github.com/shmoop207/appolo-cache) instance