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
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptKey = exports.encryptKey = exports.length = void 0;
const CryptoJS = require("crypto-js");
const key = "jam doughnut";
const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
exports.length = 16;
const randomChars = 'cuftty6f665d75d6ed6tg76dr57e4e65rftu';
function encryptKey(message) {
    return __awaiter(this, void 0, void 0, function* () {
        const encrypted = yield CryptoJS.DES.encrypt(message, key + randomChars);
        return encrypted.toString();
    });
}
exports.encryptKey = encryptKey;
function decryptKey(ciphertext) {
    return __awaiter(this, void 0, void 0, function* () {
        const decrypted = yield CryptoJS.DES.decrypt(ciphertext, key + randomChars);
        var check = decrypted.toString(CryptoJS.enc.Utf8);
        return decrypted.toString(CryptoJS.enc.Utf8);
    });
}
exports.decryptKey = decryptKey;
function generateRandomChars(charset, length) {
    let result = "";
    for (let i = 0; i < length; i++) {
        result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
}
