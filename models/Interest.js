const mongoose=require('mongoose')

const InterestsSchema=new mongoose.Schema({
    interestName:{
        type:String
    }
})

module.exports=mongoose.model('interest',InterestsSchema)