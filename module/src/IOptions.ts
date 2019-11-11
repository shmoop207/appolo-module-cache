import {IModuleOptions} from 'appolo';
import Timer = NodeJS.Timer;

export interface IOptions extends IModuleOptions {
    id?: string
    connection?: string;
    memory?: boolean
    db?: boolean
    maxSize?: number
    keyPrefix?: string
    maxAge?: number;
    dbMaxAge?: number;
    refresh?: boolean

}

export interface ICacheMetadataIndex {
    [index: string]: ICacheMetadata
}

export interface ICacheMetadata {

    options: ICacheOptions
    propertyKey: string,
    descriptor: PropertyDescriptor
    isOverride?: boolean;

}

export interface ICacheOptions {
    resolver?: Function;
    maxSize?: number;
    maxAge?: number;
    id?: string
    clone?: boolean;
    peek?: boolean;
    refresh?: boolean;
    logger?: { error: (...args: any[]) => void };
    interval?: number;
    multi?: boolean
    db?: boolean
    memory?: boolean
    dbMaxAge?: number;
    dbKeyPrefix?: string

}

export interface IInnerCacheOptions extends ICacheOptions {
    isPromise?: boolean;
    timer?: Timer | number;
    getMethod?: "get" | "peek" | "getByExpire" | "peekByExpire"

}
