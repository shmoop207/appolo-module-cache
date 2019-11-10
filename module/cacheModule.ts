import {module, Module, Util} from 'appolo';
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
        keyPrefix: "c"

    };

    constructor(options: IOptions) {
        super(options)
    }

    public get exports() {
        return [{id: this.moduleOptions.id, type: CacheProvider}];

    }

    public beforeInitialize() {

        let meta = Util.findAllReflectData<ICacheMetadataIndex>(CacheSymbol, this.app.parent.exported);

        _.forEach(meta, (item => this._createCacheActions(item)));


    }

    private _createCacheActions(item: { fn: Function, metaData: ICacheMetadataIndex }) {

        _.forEach(item.metaData, meta => this._createCacheAction(item.fn, meta));
    }

    private async _createCacheAction(fn: Function, meta: ICacheMetadata) {


        let old = fn.prototype[meta.propertyKey],$self = this;

        fn.prototype[meta.propertyKey] = async function (): Promise<any> {

            let cacheProvider = $self.app.injector.get<CacheProvider>(CacheProvider);

            let cache = cacheProvider.getCacheByScopeAndProperty(this,meta.propertyKey);

            if (!cache) {
                cache = cacheProvider.createCache(meta.options, old, this,meta.propertyKey);
            }

            return cache.get.apply(cache, arguments);
        }
    }
}
