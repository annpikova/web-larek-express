"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ConflictError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 409;
    }
}
exports.default = ConflictError;
