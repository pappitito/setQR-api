
const sharp = require('sharp')


export default async function createQR(dataEncode: any, logoURL: string ,width = 256 , height= 256,  colorDark = "#000000", colorLight = "#ffffff", logoWidth = 70, logoHeight = 70, dotScale = 1, stroke = false, strokeColour = 'black', strokeWidth = 5 ){
    const QRcode = require('easyqrcodejs-nodejs')

    if(stroke){
      logoURL = await addStroke(logoURL, strokeColour, strokeWidth)
    }

    var options: any = {
    text: dataEncode,
    width: width,
    height: height,
    colorDark : colorDark,
    colorLight : colorLight,
    correctLevel : QRcode.CorrectLevel.H,
    logo: logoURL,
    logoWidth: logoWidth,
    logoheight: logoHeight,
    dotScale: dotScale,
    PO: "#000000",
    AI: "#000000"
    
  }

    var qrcode: any = new QRcode(options)
    const data = await qrcode.toDataURL()
    return data


}

/* async function makeRounded(img: any){
  
  let imageBuffer = Buffer.from(img.split(',')[1], 'base64');
  const image = await Jimp.read(imageBuffer)
  const img64 =await image.circle().getBase64Async(Jimp.AUTO)
  return img64
} */

async function addStroke(img: any, color: string, width:number){
  const image = sharp(Buffer.from(img.split(',')[1], 'base64'));

  

    // Add the stroke to the image
    await image.extend({
      top: width,
      left: width,
      bottom: width,
      right: width,
      background: { r: 0, g: 0, b: 0},
    }).flatten({ background: { r: 255, g: 255, b: 255 } });
  
    // Convert the image back to base64
    const buffer = await image.toBuffer()
    const base64ImageWithStroke = buffer.toString('base64');
      //console.log(`data:image/png;base64,${base64ImageWithStroke}`);
    const finalImg = `data:image/png;base64,${base64ImageWithStroke}`
    return finalImg
   
  


  
  
}







