"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InternalServerError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 500;
    }
}
exports.default = InternalServerError;
