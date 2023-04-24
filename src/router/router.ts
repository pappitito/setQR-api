const express = require('express')
const {generateQR, createUser, generateAdminQR, sendMail, checkEmail, checkAnswer, getUserDetails, editUserDetails, sendNewUserMail} = require('./controllers')

const router = express.Router()
router.get('/', (req:any,res:any)=>{res.status(200).send('welcome to the qr generator')})
router.post('/generate', generateQR)
router.post('/addUser', createUser)
router.post('/adminGenerate', generateAdminQR)
router.post('/sendMail',sendMail )
router.post('/sendNewUserMail', sendNewUserMail )
router.post('/checkEmail', checkEmail )
router.post('/checkAnswer', checkAnswer)
router.post('/getUserDetails', getUserDetails)
router.patch('/editDetails', editUserDetails)


export default router