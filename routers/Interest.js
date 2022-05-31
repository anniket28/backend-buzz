const express=require('express')
const config=require('../config.json')
const Interest = require('../models/Interest')

const router=express.Router()

// User Signup
router.post('/addInterest',async(req,res)=>{
    try {
        for (let index = 0; index < req.body.length; index++) {
            let newInterest=new Interest({
                interestName:req.body[index].interestName
            })
            newInterest.save()
        }
        res.json({interestAdded:true})
    } 
    catch (error) {
        console.log("Internal Server Error "+error)
        res.send("Internal Server Error")
    }
})

module.exports=router