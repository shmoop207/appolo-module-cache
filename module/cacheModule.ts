import {module, Module,IModuleParams} from '@appolo/engine';
import {Reflector} from '@appolo/utils';
import {ICacheMetadata, ICacheMetadataIndex, IOptions} from "./src/IOptions";

import * as _ from "lodash";
import {CacheSymbol} from "./src/decorators";
import {CacheProvider} from "./src/cacheProvider";


@module()
export class CacheModule extends Module<IOptions> {

    protected readonly Defaults = <Partial<IOptions>>{
        id: "cacheProvider",
        memory: true,
        maxSize: 1000,
        keyPrefix: "c",
        cacheNull: false

    };

    public static for(options?: IOptions): IModuleParams {
        return {type:CacheModule,options};
    }

    public get exports() {
        return [{id: this.moduleOptions.id, type: CacheProvider}];

    }

    public beforeModuleInitialize() {

        let meta = this.app.tree.parent.discovery.findAllReflectData<ICacheMetadataIndex>(CacheSymbol);

        _.forEach(meta, (item => this._createCacheActions(item)));


    }

    private _createCacheActions(item: { fn: Function, metaData: ICacheMetadataIndex }) {

        _.forEach(item.metaData, meta => this._createCacheAction(item.fn, meta));
    }

    private _createCacheAction(fn: Function, meta: ICacheMetadata) {


        let old = fn.prototype[meta.propertyKey], $self = this;

        fn.prototype[meta.propertyKey] = function (): Promise<any> {

            let cacheProvider = $self.app.injector.get<CacheProvider>(CacheProvider);

            let cache = cacheProvider.getCacheByScopeAndProperty(this, meta.propertyKey);

            if (!cache) {
                cache = cacheProvider.createCache(meta.options, old, this, meta.propertyKey);
            }

            return cache.get.apply(cache, arguments);
        }
    }
}
