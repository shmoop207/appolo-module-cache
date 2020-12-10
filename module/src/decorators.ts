import {Reflector} from '@appolo/utils'
import {ICacheMetadata, ICacheMetadataIndex, ICacheOptions} from "./IOptions";

export const CacheSymbol = Symbol("CacheSymbol");


export function cache(options: ICacheOptions = {}) {

    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {

        let data = Reflector.getFnMetadata<ICacheMetadataIndex>(CacheSymbol, target.constructor, {});

        if (!data[propertyKey]) {
            data[propertyKey] = {
                options: options,
                propertyKey,
                descriptor
            };
        }
    }
}
