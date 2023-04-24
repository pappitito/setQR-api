const CryptoJS = require("crypto-js");
import { generateApiKey } from 'generate-api-key'


const key = "jam doughnut";
const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
export const length = 16
const randomChars = 'cuftty6f665d75d6ed6tg76dr57e4e65rftu'

export async function encryptKey(message: string) {
    const encrypted =  await CryptoJS.DES.encrypt(message, key + randomChars);
    return encrypted.toString();
  }
  
export async function decryptKey(ciphertext: string) {
    const decrypted = await CryptoJS.DES.decrypt(ciphertext, key + randomChars);
    var check = decrypted.toString(CryptoJS.enc.Utf8)
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
  
function generateRandomChars(charset: string, length: number) {
    let result = "";
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }
  
  



