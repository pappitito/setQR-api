const User = require('../schema/userSchema')
import createQR from '../generator'
import { generateApiKey } from 'generate-api-key'
import { decryptKey, encryptKey } from './encryptJS'
require('dotenv').config()
import {StatusCodes} from 'http-status-codes'

const nodemailer = require('nodemailer')



function stripWhitespace(input: string): string {
    return input.replace(/\s+/g, '');
  }

 async function createUser(req:any, res:any){
    const {name, email, logoUrl, settings, question, answer} = req.body
    const userObj = {
        name: name,
        email: stripWhitespace(email),
        question: question,
        answer: stripWhitespace(answer), 
        apiKey: '',
        logoUrl: logoUrl,
        settings: settings

    }
    if(!name || !email){
        
        return res.status(StatusCodes.BAD_REQUEST).json({err: 'please  complete feild input'})
    }
    else{
        try {
            const checkuser = await User.findOne({name: name, email: email})
            var user:any;
           
            if(checkuser === null){
                const myKey = generateApiKey({
                    method: 'string',
                    length: 30,
                    pool: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
                })
                    
                    
                 var newKey =  await encryptKey(myKey.toString())
                 
                userObj.apiKey = newKey
                try {
                    user = await User.create(userObj)
                    return res.status(StatusCodes.OK).json({
                        status: 'succesfully added new user, logo and settings',
                        user: userObj.name,
                        userID: user._id,
                        apiKey: myKey.toString(),
                        settings: user.settings

                })
                } catch (error) {
                    return res.status(StatusCodes.BAD_REQUEST).json({
                        msg: error
                    })
                }
            }
            else{
                return res.status(StatusCodes.BAD_REQUEST).json({
                    err: 'user already exists, if you want to change logo, use a patch request'
                })
            }
        } catch (error) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                msg: "error found",
                err: error
            })
        }
    }
}



 async function generateQR(req:any, res:any){

    interface Body{
       
        logoUrl?: any,
        logoWidth?: number,
        logoHeight?: number,
        QRwidth?: number,
        QRheight?: number,
        colorDark?: string,
        colorLight?: string,
        dotScale?: number,
        stroke?: boolean,
        strokeColour?: string,
        strokeWidth?: number,
        content: any,
    }

    interface Query{
        id?: any,
        key?: any,
    }

    var logodata: any;

     const body: Body = req.body
     const query: Query = req.query

     if(query.id && query.key && !body.logoUrl ){
        console.log('entered')
        const checkUser: any = await User.findOne({id:query.id})
        if(checkUser){
            var keyCorrect: boolean;
            
            try {
                console.log('before try')
                 keyCorrect = await checkUser.checkApiKey(query.key)
                 console.log('after try')
                 if(keyCorrect){
                    logodata = checkUser.logoUrl
                }
                else{
                    return res.status(StatusCodes.UNAUTHORIZED).send({err: "Invalid  API key after check"})  
                }
            } catch (error) {
                
                return res.status(StatusCodes.UNAUTHORIZED).send({err: "Invalid ID or API key after check"})
            }
           
        }
        else{
            return res.status(StatusCodes.UNAUTHORIZED).json({err: 'Invalid ID or API key'})
        }
     }
     else if(!query.id && query.key){
        return res.status(StatusCodes.BAD_REQUEST).json({err: 'please input ID if you have an API key'})
     }
     else if(query.id && !query.key){
        return res.status(StatusCodes.BAD_REQUEST).json({err: 'please input API key if you have an ID'})
     }
     else{
        logodata = body.logoUrl
     }
        try {
            const qrdata = await createQR(body.content, logodata, body.QRwidth, body.QRheight, body.colorDark, body.colorLight,  body.logoWidth, body.logoHeight, body.dotScale, body.stroke, body.strokeColour, body.strokeWidth)
            return res.status(StatusCodes.OK).json({msg: 'success', QR: qrdata})
        } catch (error) {
            return res.status(StatusCodes.BAD_REQUEST).json({err: error, msg: 'something went wrong in generating QR'})
        }
     


}

async function generateAdminQR(req: any, res: any){
    interface Body{
       
        logoUrl?: any,
        logoWidth?: number,
        logoHeight?: number
        width?: number,
        height?: number,
        colorDark?: string,
        colorLight?: string,
        dotScale?: number,
        stroke?: boolean,
        strokeColour?: string,
        strokeWidth?: number,
        content: any,
        adminKey: string
    }

    const body: Body = req.body
    if(!body.adminKey){
        return res.status(StatusCodes.UNAUTHORIZED).send({msg: 'unauthorized access to this endpoint'})
    }
    else if(body.adminKey === process.env.ADMIN_KEY){
        try {
            const qrdata = await createQR(body.content, body.logoUrl, body.width, body.height, body.colorDark, body.colorLight,  body.logoWidth, body.logoHeight, body.dotScale, body.stroke, body.strokeColour, body.strokeWidth)
            return res.status(StatusCodes.OK).json({msg: 'success', QR: qrdata})
        } catch (error) {
            return res.status(StatusCodes.BAD_REQUEST).json({err: error, msg: 'something went wrong in generating QR'})
        }
    }
    else return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'something went wrong '})
}



async function sendNewUserMail(req: any, res: any){
    interface Body{
        code: number,
        email: string,
    }

    const body: Body = req.body
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'titonwudinjo@gmail.com',
            pass: 'dujmkqcxbzlqpdhm'
        }
    });

   if(body.email.includes('@') && !body.email.endsWith('@')){
    try {
        const user = await User.findOne({email: body.email})
        if(user){
            return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'exists'}) 
        }
        else{
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
                await transporter.sendMail(mailOptions, function(error: any, info: any){
                    if (error) {
                        console.log(error);
                    } else {
                        return res.status(StatusCodes.ACCEPTED).json({msg: 'OK'})
                    }
                });
            } catch (error) {
                return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'something went wrong ', error: error})
            }
        }
    } catch (error) {
       
    }
   }
  
   else{
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'invalid email'})
   }
}

async function sendMail(req: any, res: any){
    interface Body{
        code: number,
        email: string,
    }

    const body: Body = req.body
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'titonwudinjo@gmail.com',
            pass: 'dujmkqcxbzlqpdhm'
        }
    });

   if(body.email.includes('@') && !body.email.endsWith('@')){
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
                await transporter.sendMail(mailOptions, function(error: any, info: any){
                    if (error) {
                        console.log(error);
                    } else {
                        return res.status(StatusCodes.ACCEPTED).json({msg: 'OK'})
                    }
                });
            } catch (error) {
                return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'something went wrong ', error: error})
            }
        }
     catch (error) {
       
    }
   }
  
   else{
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'invalid email'})
   }
}

async function checkEmail(req: any, res: any){
    interface Body{
        email: string
    }
    const body: Body = req.body
    const checkUser = await User.findOne({email: body.email})
    if(checkUser){
        return res.status(StatusCodes.ACCEPTED).json({msg: 'OK', question: checkUser.question})
    }
    else{
        return res.status(StatusCodes.BAD_REQUEST).json({msg: 'email not found'})
    }
}

async function checkAnswer(req: any, res: any){
    interface Body{
        email: string
        answer: string
    }
    const body: Body = req.body
    const checkUser = await User.findOne({email: body.email})
    if(checkUser.answer === body.answer){
        var newKey = await decryptKey(checkUser.apiKey)
        return res.status(StatusCodes.ACCEPTED).json({msg: 'correct', apiKey: newKey, userID: checkUser._id})
    }
    else{
        return res.status(StatusCodes.BAD_REQUEST).json({msg: 'incorrect'})
    }
}

async function getKey(req: any, res: any){
    interface Body{
        email: string
    }
    const body: Body = req.body
    const checkUser = await User.findOne({email: body.email})
    if(checkUser){
        return res.status(StatusCodes.ACCEPTED).json({data: {apiKey: checkUser.apiKey, userID: checkUser.user._id}})
    }
    else{
        return res.status(StatusCodes.BAD_REQUEST).json({msg: 'email not found'})
    }
}

async function getUserDetails(req: any, res: any){
    interface Body{
        userID: string,
        apiKey: string
    }
    const {userID, apiKey}: Body = req.body
    try {
        const user = await User.findOne({_id: stripWhitespace(userID)})
    if(user){
        const decryptedKey = await decryptKey(user.apiKey)
        if(stripWhitespace(apiKey) === decryptedKey){
            return res.status(StatusCodes.OK).json({
                status: true,
                userData: user
            })
        }
        else{
            return res.status(StatusCodes.UNAUTHORIZED).json({status: false})
        }
    }
    else {
        return res.status(StatusCodes.UNAUTHORIZED).json({status: false})
    }
    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            status: false,
            msg: error
        })
    }
}

async function editUserDetails(req: any, res: any){
    interface Body{
        userID: string,
        logoUrl?: any,
        settings?: any
    }

    const {logoUrl, settings, userID}: Body = req.body

    const updateUserObj = {
        
        logoUrl: logoUrl,
        settings: settings

    }
    try {
        const user = await User.findOneAndUpdate({_id: userID}, updateUserObj, {new: true, runValidators: true})
        return res.status(StatusCodes.OK).json({
            status: true,
            statusMsg: 'succesfully updated logo and settings',
            userID: user._id,
            logoUrl: user.logoUrl,
            settings: user.settings

    })
    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({msg: error})
    }
}

module.exports = {createUser, generateQR, generateAdminQR, sendMail, checkEmail, getKey, checkAnswer, getUserDetails, editUserDetails, sendNewUserMail}


