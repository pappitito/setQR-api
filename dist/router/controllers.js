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
const User = require('../schema/userSchema');
const generator_1 = __importDefault(require("../generator"));
const generate_api_key_1 = require("generate-api-key");
const encryptJS_1 = require("./encryptJS");
require('dotenv').config();
const http_status_codes_1 = require("http-status-codes");
const nodemailer = require('nodemailer');
function stripWhitespace(input) {
    return input.replace(/\s+/g, '');
}
function createUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { name, email, logoUrl, settings, question, answer } = req.body;
        const userObj = {
            name: name,
            email: stripWhitespace(email),
            question: question,
            answer: stripWhitespace(answer),
            apiKey: '',
            logoUrl: logoUrl,
            settings: settings
        };
        if (!name || !email) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ err: 'please  complete feild input' });
        }
        else {
            try {
                const checkuser = yield User.findOne({ name: name, email: email });
                var user;
                if (checkuser === null) {
                    const myKey = (0, generate_api_key_1.generateApiKey)({
                        method: 'string',
                        length: 30,
                        pool: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
                    });
                    var newKey = yield (0, encryptJS_1.encryptKey)(myKey.toString());
                    userObj.apiKey = newKey;
                    try {
                        user = yield User.create(userObj);
                        return res.status(http_status_codes_1.StatusCodes.OK).json({
                            status: 'succesfully added new user, logo and settings',
                            user: userObj.name,
                            userID: user._id,
                            apiKey: myKey.toString(),
                            settings: user.settings
                        });
                    }
                    catch (error) {
                        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                            msg: error
                        });
                    }
                }
                else {
                    return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                        err: 'user already exists, if you want to change logo, use a patch request'
                    });
                }
            }
            catch (error) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                    msg: "error found",
                    err: error
                });
            }
        }
    });
}
function generateQR(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var logodata;
        const body = req.body;
        const query = req.query;
        if (query.id && query.key && !body.logoUrl) {
            console.log('entered');
            const checkUser = yield User.findOne({ id: query.id });
            if (checkUser) {
                var keyCorrect;
                try {
                    console.log('before try');
                    keyCorrect = yield checkUser.checkApiKey(query.key);
                    console.log('after try');
                    if (keyCorrect) {
                        logodata = checkUser.logoUrl;
                    }
                    else {
                        return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).send({ err: "Invalid  API key after check" });
                    }
                }
                catch (error) {
                    return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).send({ err: "Invalid ID or API key after check" });
                }
            }
            else {
                return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ err: 'Invalid ID or API key' });
            }
        }
        else if (!query.id && query.key) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ err: 'please input ID if you have an API key' });
        }
        else if (query.id && !query.key) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ err: 'please input API key if you have an ID' });
        }
        else {
            logodata = body.logoUrl;
        }
        try {
            const qrdata = yield (0, generator_1.default)(body.content, logodata, body.QRwidth, body.QRheight, body.colorDark, body.colorLight, body.logoWidth, body.logoHeight, body.dotScale, body.stroke, body.strokeColour, body.strokeWidth);
            return res.status(http_status_codes_1.StatusCodes.OK).json({ msg: 'success', QR: qrdata });
        }
        catch (error) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ err: error, msg: 'something went wrong in generating QR' });
        }
    });
}
function generateAdminQR(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = req.body;
        if (!body.adminKey) {
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).send({ msg: 'unauthorized access to this endpoint' });
        }
        else if (body.adminKey === process.env.ADMIN_KEY) {
            try {
                const qrdata = yield (0, generator_1.default)(body.content, body.logoUrl, body.width, body.height, body.colorDark, body.colorLight, body.logoWidth, body.logoHeight, body.dotScale, body.stroke, body.strokeColour, body.strokeWidth);
                return res.status(http_status_codes_1.StatusCodes.OK).json({ msg: 'success', QR: qrdata });
            }
            catch (error) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ err: error, msg: 'something went wrong in generating QR' });
            }
        }
        else
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ msg: 'something went wrong ' });
    });
}
function sendNewUserMail(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = req.body;
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'titonwudinjo@gmail.com',
                pass: 'dujmkqcxbzlqpdhm'
            }
        });
        if (body.email.includes('@') && !body.email.endsWith('@')) {
            try {
                const user = yield User.findOne({ email: body.email });
                if (user) {
                    return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ msg: 'exists' });
                }
                else {
                    let mailOptions = {
                        from: 'no-reply@setQR',
                        to: body.email,
                        subject: 'Verification code',
                        html: `<div>
                        <h4>your verification code is </h4>
                        <h1>${body.code}</h1>
                </div>`
                    };
                    try {
                        yield transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.log(error);
                            }
                            else {
                                return res.status(http_status_codes_1.StatusCodes.ACCEPTED).json({ msg: 'OK' });
                            }
                        });
                    }
                    catch (error) {
                        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ msg: 'something went wrong ', error: error });
                    }
                }
            }
            catch (error) {
            }
        }
        else {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ msg: 'invalid email' });
        }
    });
}
function sendMail(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = req.body;
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'titonwudinjo@gmail.com',
                pass: 'dujmkqcxbzlqpdhm'
            }
        });
        if (body.email.includes('@') && !body.email.endsWith('@')) {
            try {
                let mailOptions = {
                    from: 'no-reply@setQR',
                    to: body.email,
                    subject: 'Verification code',
                    html: `<div>
                        <h4>your verification code is </h4>
                        <h1>${body.code}</h1>
                </div>`
                };
                try {
                    yield transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        }
                        else {
                            return res.status(http_status_codes_1.StatusCodes.ACCEPTED).json({ msg: 'OK' });
                        }
                    });
                }
                catch (error) {
                    return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ msg: 'something went wrong ', error: error });
                }
            }
            catch (error) {
            }
        }
        else {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ msg: 'invalid email' });
        }
    });
}
function checkEmail(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = req.body;
        const checkUser = yield User.findOne({ email: body.email });
        if (checkUser) {
            return res.status(http_status_codes_1.StatusCodes.ACCEPTED).json({ msg: 'OK', question: checkUser.question });
        }
        else {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ msg: 'email not found' });
        }
    });
}
function checkAnswer(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = req.body;
        const checkUser = yield User.findOne({ email: body.email });
        if (checkUser.answer === body.answer) {
            var newKey = yield (0, encryptJS_1.decryptKey)(checkUser.apiKey);
            return res.status(http_status_codes_1.StatusCodes.ACCEPTED).json({ msg: 'correct', apiKey: newKey, userID: checkUser._id });
        }
        else {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ msg: 'incorrect' });
        }
    });
}
function getKey(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = req.body;
        const checkUser = yield User.findOne({ email: body.email });
        if (checkUser) {
            return res.status(http_status_codes_1.StatusCodes.ACCEPTED).json({ data: { apiKey: checkUser.apiKey, userID: checkUser.user._id } });
        }
        else {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ msg: 'email not found' });
        }
    });
}
function getUserDetails(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { userID, apiKey } = req.body;
        try {
            const user = yield User.findOne({ _id: stripWhitespace(userID) });
            if (user) {
                const decryptedKey = yield (0, encryptJS_1.decryptKey)(user.apiKey);
                if (stripWhitespace(apiKey) === decryptedKey) {
                    return res.status(http_status_codes_1.StatusCodes.OK).json({
                        status: true,
                        userData: user
                    });
                }
                else {
                    return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ status: false });
                }
            }
            else {
                return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ status: false });
            }
        }
        catch (error) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                status: false,
                msg: error
            });
        }
    });
}
function editUserDetails(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { logoUrl, settings, userID } = req.body;
        const updateUserObj = {
            logoUrl: logoUrl,
            settings: settings
        };
        try {
            const user = yield User.findOneAndUpdate({ _id: userID }, updateUserObj, { new: true, runValidators: true });
            return res.status(http_status_codes_1.StatusCodes.OK).json({
                status: true,
                statusMsg: 'succesfully updated logo and settings',
                userID: user._id,
                logoUrl: user.logoUrl,
                settings: user.settings
            });
        }
        catch (error) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ msg: error });
        }
    });
}
module.exports = { createUser, generateQR, generateAdminQR, sendMail, checkEmail, getKey, checkAnswer, getUserDetails, editUserDetails, sendNewUserMail };
