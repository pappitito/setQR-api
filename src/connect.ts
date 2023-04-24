const mongoose = require('mongoose')

  function connectDB(url:any){
    return mongoose.connect(url)
}

export default connectDB