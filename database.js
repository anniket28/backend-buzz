// Require
const config=require('./config.json')
const mongoose=require('mongoose')
const mongo_uri=config.mongoURI
// console.log(mongo_uri)

// Database connection
const connection=mongoose.connect(mongo_uri,()=>{
    console.log("Connected to Database")
})

module.exports=connection