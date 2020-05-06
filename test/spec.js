"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appolo_1 = require("appolo");
const Q = require("bluebird");
const handler_1 = require("./src/handler");
const index_1 = require("../index");
const chai = require("chai");
const sinonChai = require("sinon-chai");
const cacheProvider_1 = require("../module/src/cacheProvider");
let should = require('chai').should();
chai.use(sinonChai);
describe("Cache Spec", function () {
    let app;
    beforeEach(async () => {
        app = appolo_1.createApp({ root: __dirname, environment: "production", port: 8181 });
        await app.module(new index_1.CacheModule({ connection: process.env.REDIS }));
        await app.launch();
    });
    afterEach(async () => {
        await app.reset();
    });
    it("should cache sync", async () => {
        let handler = app.injector.get(handler_1.Handler);
        handler.handle();
        handler.handle();
        handler.handle();
        handler.test.should.be.eq(1);
    });
    it("should cache sync expire", async () => {
        let handler = app.injector.get(handler_1.Handler);
        await handler.handle();
        await Q.delay(100);
        await handler.handle();
        handler.test.should.be.eq(2);
    });
    it("should cache sync expire with key", async () => {
        let handler = app.injector.get(handler_1.Handler);
        let result1 = await handler.handle3("aa");
        await Q.delay(100);
        await handler.handle3("bb");
        let result2 = await handler.handle3("bb");
        result1.should.be.eq("aa1");
        result2.should.be.eq("bb2");
    });
    it.only("should cache with refresh", async () => {
        let handler = app.injector.get(handler_1.Handler);
        await handler.handle4();
        await Q.delay(55);
        await handler.handle4();
        await handler.handle4();
        handler.test.should.be.eq(2);
    });
    it("should cache null response", async () => {
        let handler = app.injector.get(handler_1.Handler);
        await handler.handle8(11);
        await Q.delay(55);
        await handler.handle8(11);
        let result = await handler.handle8(11);
        should.not.exist(result);
        handler.counter.should.be.eq(1);
    });
    it("should  not cache null response", async () => {
        let handler = app.injector.get(handler_1.Handler);
        await handler.handle9(11);
        await Q.delay(55);
        await handler.handle9(11);
        let result = await handler.handle9(11);
        should.not.exist(result);
        handler.counter.should.be.eq(3);
    });
    it("should cache with redis", async () => {
        let handler = app.injector.get(handler_1.Handler);
        await handler.handle5();
        await Q.delay(100);
        await handler.handle5();
        handler.test.should.be.eq(1);
        await Q.delay(800);
        let result = await handler.handle5();
        await handler.handle5();
        await Q.delay(100);
        result.should.be.eq(2);
        handler.test.should.be.eq(2);
    });
    it("should cache with interval", async () => {
        let handler = app.injector.get(handler_1.Handler);
        await handler.handle6("aa");
        await handler.handle6("bb");
        await Q.delay(250);
        await handler.handle6("aa");
        await handler.handle6("bb");
        let result1 = await handler.handle6("aa");
        let result2 = await handler.handle6("bb");
        result1.should.be.eq("5aa");
        result2.should.be.eq("6bb");
    });
    it('should call async mutli same key cache', async () => {
        let handler = app.injector.get(handler_1.Handler);
        let [result1, result2, result3] = await Promise.all([handler.handler7(1), handler.handler7(1), handler.handler7(2)]);
        handler.test.should.be.eq(2);
        result2.should.be.eq(1);
        result1.should.be.eq(1);
        result3.should.be.eq(2);
    });
    it('should call with inherit', async () => {
        let handler1 = app.injector.get(handler_1.InheritHandler1);
        let handler2 = app.injector.get(handler_1.InheritHandler2);
        let cacheProvider = app.injector.get(cacheProvider_1.CacheProvider);
        handler1.handle();
        handler2.handle();
        let caches = cacheProvider.getAllCaches();
        caches.length.should.be.eq(2);
        (caches[0] === caches[1]).should.not.be.ok;
    });
});
//# sourceMappingURL=spec.js.map