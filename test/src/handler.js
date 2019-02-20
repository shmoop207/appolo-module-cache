"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_1 = require("appolo");
const index_1 = require("../../index");
let Handler = class Handler {
    constructor() {
        this.test = 0;
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
    index_1.cache({ maxAge: 100, refresh: true, db: true, dbMaxAge: 1000 })
], Handler.prototype, "handle5", null);
tslib_1.__decorate([
    index_1.cache({ interval: 100 })
], Handler.prototype, "handle6", null);
Handler = tslib_1.__decorate([
    appolo_1.define(),
    appolo_1.singleton()
], Handler);
exports.Handler = Handler;
//# sourceMappingURL=handler.js.map