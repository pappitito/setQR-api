import mongoose from "mongoose";
import { decryptKey } from "../router/encryptJS";


const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    apiKey: String,
    question: String,
    answer: String,
    logoUrl: String,
    settings:{
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
userSchema.methods.checkApiKey = async function(userkey:any){

    

    try {
        const decryptedKey = await decryptKey(this.apiKey)
        
        if(userkey === decryptedKey){
            return true
        }
        else return false

        
        
        
    } catch (error) {
        console.log(error)
        
    }

}

module.exports = mongoose.model('User', userSchema);