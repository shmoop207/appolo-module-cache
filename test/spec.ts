import {App, createApp} from 'appolo'
import * as Q from 'bluebird'
import {Handler} from "./src/handler";
import {CacheModule} from "../index";
import chai = require('chai');
import    sinonChai = require("sinon-chai");


let should = require('chai').should();
chai.use(sinonChai);


describe("Cache Spec", function () {

    let app: App;


    beforeEach(async () => {

        app = createApp({root: __dirname, environment: "production", port: 8181});

        await app.module(new CacheModule({connection: process.env.REDIS}));

        await app.launch();

    });

    afterEach(async () => {
        await app.reset();
    })

    it("should cache sync", async () => {

        let handler = app.injector.get<Handler>(Handler);

        handler.handle();
        handler.handle();
        handler.handle();

        handler.test.should.be.eq(1);

    });

    it("should cache sync expire", async () => {


        let handler = app.injector.get<Handler>(Handler);

        await handler.handle();
        await Q.delay(100);

        await handler.handle();

        handler.test.should.be.eq(2);
    })

    it("should cache sync expire with key", async () => {


        let handler = app.injector.get<Handler>(Handler);

        let result1 = await handler.handle3("aa");
        await Q.delay(100);

        await handler.handle3("bb");
        let result2 = await handler.handle3("bb");

        result1.should.be.eq("aa1");
        result2.should.be.eq("bb2");
    })

    it("should cache with refresh", async () => {

        let handler = app.injector.get<Handler>(Handler);

        await handler.handle4();
        await Q.delay(55);
        await handler.handle4();
        await handler.handle4();

        handler.test.should.be.eq(2);
    })

    it("should cache with redis", async () => {

        let handler = app.injector.get<Handler>(Handler);

        await handler.handle5();
        await Q.delay(100);
        await handler.handle5();
        handler.test.should.be.eq(1);
        await Q.delay(500);
        await handler.handle5();
        await Q.delay(100);
        handler.test.should.be.eq(2);
    })

    it("should cache with interval", async () => {

        let handler = app.injector.get<Handler>(Handler);

        await handler.handle6("aa");
        await handler.handle6("bb");
        await Q.delay(250);
        await handler.handle6("aa");
        await handler.handle6("bb");
        let result1=  await handler.handle6("aa");
        let result2=  await handler.handle6("bb");

       result1.should.be.eq("5aa");

       result2.should.be.eq("6bb");

    })
});


