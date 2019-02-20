import {Util} from 'appolo'
import {ICacheMetadata, ICacheMetadataIndex, ICacheOptions} from "./IOptions";

export const CacheSymbol = Symbol("CacheSymbol");


export function cache(options: ICacheOptions = {}) {

    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {

        let data = Util.getReflectData<ICacheMetadataIndex>(CacheSymbol, target.constructor, {});

        if (!data[propertyKey]) {
            data[propertyKey] = {
                options: options,
                propertyKey,
                descriptor
            };
        }
    }
}
