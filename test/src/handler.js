"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_1 = require("appolo");
const index_1 = require("../../index");
let Handler = class Handler {
    constructor() {
        this.test = 0;
        this.counter = 0;
    }
    handle() {
        return ++this.test;
    }
    async handle2() {
        return ++this.test;
    }
    async handle3(name) {
        ++this.test;
        return name + this.test;
    }
    async handle4() {
        return ++this.test;
    }
    async handle5() {
        return ++this.test;
    }
    async handle6(name) {
        ++this.test;
        return this.test + name;
    }
    async handler7(id) {
        await appolo_1.Util.delay(10);
        ++this.test;
        return this.test;
    }
    async handle8(id) {
        await appolo_1.Util.delay(10);
        this.counter++;
        return null;
    }
    async handle9(id) {
        await appolo_1.Util.delay(10);
        this.counter++;
        return null;
    }
};
tslib_1.__decorate([
    index_1.cache({ maxAge: 100 })
], Handler.prototype, "handle", null);
tslib_1.__decorate([
    index_1.cache({ maxAge: 100 })
], Handler.prototype, "handle2", null);
tslib_1.__decorate([
    index_1.cache({ maxAge: 100 })
], Handler.prototype, "handle3", null);
tslib_1.__decorate([
    index_1.cache({ maxAge: 100, refresh: true })
], Handler.prototype, "handle4", null);
tslib_1.__decorate([
    index_1.cache({ maxAge: 100, refresh: true, db: true, dbMaxAge: 1000, memory: false })
], Handler.prototype, "handle5", null);
tslib_1.__decorate([
    index_1.cache({ interval: 100 })
], Handler.prototype, "handle6", null);
tslib_1.__decorate([
    index_1.cache()
], Handler.prototype, "handler7", null);
tslib_1.__decorate([
    index_1.cache({})
], Handler.prototype, "handle8", null);
tslib_1.__decorate([
    index_1.cache({ cacheNull: false })
], Handler.prototype, "handle9", null);
Handler = tslib_1.__decorate([
    appolo_1.define(),
    appolo_1.singleton()
], Handler);
exports.Handler = Handler;
let BaseHandler = class BaseHandler {
    constructor() {
        this.test = 0;
    }
    handle() {
        return ++this.test;
    }
};
tslib_1.__decorate([
    index_1.cache({ maxAge: 100 })
], BaseHandler.prototype, "handle", null);
BaseHandler = tslib_1.__decorate([
    appolo_1.define(),
    appolo_1.singleton()
], BaseHandler);
exports.BaseHandler = BaseHandler;
let InheritHandler1 = class InheritHandler1 extends BaseHandler {
};
InheritHandler1 = tslib_1.__decorate([
    appolo_1.define(),
    appolo_1.singleton()
], InheritHandler1);
exports.InheritHandler1 = InheritHandler1;
let InheritHandler2 = class InheritHandler2 extends BaseHandler {
};
InheritHandler2 = tslib_1.__decorate([
    appolo_1.define(),
    appolo_1.singleton()
], InheritHandler2);
exports.InheritHandler2 = InheritHandler2;
//# sourceMappingURL=handler.js.map