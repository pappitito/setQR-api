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
const sharp = require('sharp');
function createQR(dataEncode, logoURL, width = 256, height = 256, colorDark = "#000000", colorLight = "#ffffff", logoWidth = 70, logoHeight = 70, dotScale = 1, stroke = false, strokeColour = 'black', strokeWidth = 5) {
    return __awaiter(this, void 0, void 0, function* () {
        const QRcode = require('easyqrcodejs-nodejs');
        if (stroke) {
            logoURL = yield addStroke(logoURL, strokeColour, strokeWidth);
        }
        var options = {
            text: dataEncode,
            width: width,
            height: height,
            colorDark: colorDark,
            colorLight: colorLight,
            correctLevel: QRcode.CorrectLevel.H,
            logo: logoURL,
            logoWidth: logoWidth,
            logoheight: logoHeight,
            dotScale: dotScale,
            PO: "#000000",
            AI: "#000000"
        };
        var qrcode = new QRcode(options);
        const data = yield qrcode.toDataURL();
        return data;
    });
}
exports.default = createQR;
/* async function makeRounded(img: any){
  
  let imageBuffer = Buffer.from(img.split(',')[1], 'base64');
  const image = await Jimp.read(imageBuffer)
  const img64 =await image.circle().getBase64Async(Jimp.AUTO)
  return img64
} */
function addStroke(img, color, width) {
    return __awaiter(this, void 0, void 0, function* () {
        const image = sharp(Buffer.from(img.split(',')[1], 'base64'));
        // Add the stroke to the image
        yield image.extend({
            top: width,
            left: width,
            bottom: width,
            right: width,
            background: { r: 0, g: 0, b: 0 },
        }).flatten({ background: { r: 255, g: 255, b: 255 } });
        // Convert the image back to base64
        const buffer = yield image.toBuffer();
        const base64ImageWithStroke = buffer.toString('base64');
        //console.log(`data:image/png;base64,${base64ImageWithStroke}`);
        const finalImg = `data:image/png;base64,${base64ImageWithStroke}`;
        return finalImg;
    });
}
