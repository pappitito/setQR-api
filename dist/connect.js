"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
function connectDB(url) {
    return mongoose.connect(url);
}
exports.default = connectDB;
