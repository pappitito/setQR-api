"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connect_1 = __importDefault(require("./connect"));
const router_1 = __importDefault(require("./router/router"));
require('dotenv').config();
const helmet = require('helmet');
const cors = require('cors');
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use('/api', router_1.default);
//starting server function
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, connect_1.default)(process.env.mongo_uri);
            console.log('connected to the DB');
            app.listen(port, () => console.log(`server is listening via port ${port} `));
        }
        catch (error) {
            console.log(error);
        }
    });
}
//starting the server
start();
