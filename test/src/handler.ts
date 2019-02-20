import {define, singleton} from 'appolo'
import {cache} from "../../index";

@define()
@singleton()
export class Handler {

    public  test = 0;

    @cache({maxAge: 100})
    handle() {
        return ++this.test;
    }

    @cache({maxAge: 100})
    async handle2() {
        return ++this.test;
    }

    @cache({maxAge: 100})
    async handle3(name:string) {
        ++this.test;

        return name+this.test;
    }

    @cache({maxAge: 100,refresh:true})
    async handle4() {

        return ++this.test;
    }

    @cache({maxAge: 100,refresh:true,db:true,dbMaxAge:1000})
    async handle5() {

        return ++this.test;
    }
}