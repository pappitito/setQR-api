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
const mongoose_1 = __importDefault(require("mongoose"));
const encryptJS_1 = require("../router/encryptJS");
const userSchema = new mongoose_1.default.Schema({
    name: String,
    email: String,
    apiKey: String,
    question: String,
    answer: String,
    logoUrl: String,
    settings: {
        width: Number,
        height: Number,
        colorLight: String,
        colorDark: String,
        logoWidth: Number,
        logoHeight: Number,
        logoStroke: Boolean,
        strokeWidth: Number,
        dotScale: Number
    }
});
//hash the passkey of user
//check user pin
userSchema.methods.checkApiKey = function (userkey) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const decryptedKey = yield (0, encryptJS_1.decryptKey)(this.apiKey);
            if (userkey === decryptedKey) {
                return true;
            }
            else
                return false;
        }
        catch (error) {
            console.log(error);
        }
    });
};
module.exports = mongoose_1.default.model('User', userSchema);
