import {define, singleton, Util} from 'appolo'
import {cache} from "../../index";

@define()
@singleton()
export class Handler {

    public test: number = 0;

    @cache({maxAge: 100})
    handle() {
        return ++this.test;
    }

    @cache({maxAge: 100})
    async handle2() {
        return ++this.test;
    }

    @cache({maxAge: 100})
    async handle3(name: string) {
        ++this.test;

        return name + this.test;
    }

    @cache({maxAge: 100, refresh: true})
    async handle4() {

        return ++this.test;
    }

    @cache({maxAge: 100, refresh: true, db: true, dbMaxAge: 1000, memory: false})
    async handle5() {

        return ++this.test;
    }

    @cache({interval: 100})
    async handle6(name: string) {
        ++this.test;
        return this.test + name;
    }

    @cache()
    async handler7(id: number) {

        await Util.delay(10);

        ++this.test;

        return this.test
    }

    @cache({})
    public async handle8(id: number) {

        await Util.delay(10);

        this.counter++;

        return null
    }

    @cache({cacheNull: false})
    public async handle9(id: number) {

        await Util.delay(10);

        this.counter++;

        return null
    }

    public counter = 0;
}


@define()
@singleton()
export class BaseHandler {
    public test = 0;

    @cache({maxAge: 100})
    handle() {
        return ++this.test;
    }
}


@define()
@singleton()
export class InheritHandler1 extends BaseHandler {

}

@define()
@singleton()
export class InheritHandler2 extends BaseHandler {

}
