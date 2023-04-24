import connectDB from "./connect"
import router from "./router/router"
require('dotenv').config()
const helmet = require('helmet')
const cors = require('cors')



const express = require('express')

const app = express()
const port = process.env.PORT || 5000


app.use(express.json())
app.use(helmet())
app.use(cors())






app.use('/api', router)

//starting server function
async function start(){
    try {
        await connectDB(process.env.mongo_uri)
        console.log('connected to the DB');
        app.listen(port,()=> console.log(`server is listening via port ${port} `))
    } catch (error) {
        console.log(error)
    }
}

//starting the server
start() 



