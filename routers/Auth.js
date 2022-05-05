const express=require('express')
const User=require('../models/User')
var jwt=require('jsonwebtoken')
const multer=require('multer')
const fetchuser=require('../middleware/fetchuser')
const config=require('../config.json')

const router=express.Router()

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./static/')
    },
    filename:function(req,file,cb){
        cb(null,new Date().toISOString()+file.originalname)
    }
})

const fileFilter=(req,file,cb)=>{
    if(file.mimetype==='image/jpeg' || file.mimetype==='image/jpg' || file.mimetype==='image/png'){
        cb(null,true)
    }
    else{
        cb(null,false)
    }
}

const upload=multer({storage:storage,
    limits:{
        fileSize:1024*1024*5,
    },
    fileFilter:fileFilter
})

// User Check
router.post('/check-user',async(req,res)=>{
    try{
        // Check If User Exists
        let user=await User.findOne({phone_number:req.body.phoneNumber})
        // If Exists
        if(user){
            const data={
                user:{
                    id:user._id
                }
            }
            const authtoken=jwt.sign(data,config.JWT_SECRET)
            return res.json({exists:true,user:user,authtoken:authtoken})
        }
        res.json({exists:false})
    }
    catch (error) {
        console.log("Internal Server Error "+error)
        res.send("Internal Server Error")
    }
})

// User Signup
router.post('/signup',upload.array('images',5),async(req,res)=>{
    try {
        // If user doesn't exists, create new user
        let user=new User({
            phone_number:req.body.phoneNumber,
            full_name:req.body.fullName,
            buzz_name:req.body.buzzName,
            date_of_birth:req.body.dateOfBirth,
            gender:req.body.gender,
            interests:req.body.interests,
            bio:req.body.bio,
            country:req.body.country,
            city:req.body.city,
            profession:req.body.profession,
            email:req.body.email
        })
        // console.log(req.files)
        let imageArray=[]
        for (let index = 0; index < req.files.length; index++) {
            imageArray.push(req.files[index].path)
        }
        console.log(imageArray) 
        user.image=imageArray
        user.save()
        // Fetching User
        user=await User.findOne({phone_number:req.body.phoneNumber})
        const data={
            user:{
                id:user._id
            }
        }
        const authtoken=jwt.sign(data,config.JWT_SECRET)
        res.json({success:true,user:user,authtoken:authtoken,"Success":"User Signup Successful"})
    } 
    catch (error) {
        console.log("Internal Server Error "+error)
        res.send("Internal Server Error")
    }
})

// Get User
router.get('/fetchuser',fetchuser,async(req,res)=>{
    try{
        const userid=req.user.id
        const user=await User.findById(userid)
        res.json({user:user})
    }
    catch (error) {
        console.log("Internal Server Error "+error)
        res.send("Internal Server Error")
    }
})

router.post('/upload',(req,res)=>{
    // upload(req,res,function(err) {
    //     //console.log(req.body);
    //     console.log(req.files);
    //     if(err) {
    //         console.log(err)
    //         return res.end("Error uploading file.");
    //     }
    //     res.end("File is uploaded");
    // });
})

module.exports=router