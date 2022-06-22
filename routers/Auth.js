// Require
const express=require('express')
const User=require('../models/User')
var jwt=require('jsonwebtoken')
const multer=require('multer')
const fetchuser=require('../middleware/fetchuser')
const { v4: uuidv4 } = require('uuid');
const config=require('../config.json')

// Router
const router=express.Router()

// Multer Storage
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./static/')
    },
    filename:function(req,file,cb){
        cb(null,uuidv4()+"_"+Date.now()+"_"+file.originalname)
    }
})

// File Filter For Multer Images
const fileFilter=(req,file,cb)=>{
    if(file.mimetype==='image/jpeg' || file.mimetype==='image/jpg' || file.mimetype==='image/png'){
        cb(null,true)
    }
    else{
        cb(null,false)
    }
}

// Upload For Multer Images
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

            // Liked To
            let likedTo=[]
            for (let index = 0; index < user.likedTo.length; index++) {
                const userLikedTo=await User.findById(user.likedTo[index])
                likedTo.push(userLikedTo)
            }
            // Liked By
            let likedBy=[]
            for (let index = 0; index < user.likedBy.length; index++) {
                const userLikedBy=await User.findById(user.likedBy[index])
                likedBy.push(userLikedBy)
            }
            // Leftswiped By
            let leftswipedBy=[]
            for (let index = 0; index < user.leftSwipedBy.length; index++) {
                const userleftswipedBy=await User.findById(user.leftSwipedBy[index])
                leftswipedBy.push(userleftswipedBy)
            }
            // Leftswiped To
            let leftswipedTo=[]
            for (let index = 0; index < user.leftSwipedTo.length; index++) {
                const userleftswipedTo=await User.findById(user.leftSwipedTo[index])
                leftswipedTo.push(userleftswipedTo)
            }

            const authtoken=jwt.sign(data,config.JWT_SECRET)
            return res.json({exists:true,user:user,authtoken:authtoken,likedTo:likedTo,likedBy:likedBy,leftswipedBy:leftswipedBy,leftswipedTo:leftswipedTo})
        }

        res.json({exists:false})
    }
    catch (error) {
        console.log("Internal Server Error "+error)
        res.send("Internal Server Error")
    }
})

// Check if Buzz Name is Unique
router.post('/isBuzzNameUnique',async(req,res)=>{
    try{
        // Check If User Buzz Name is unique
        let buzzNameUniqueCheck=await User.findOne({buzz_name:req.body.buzzName})
        // If Exists
        if(buzzNameUniqueCheck){
            return res.json({buzzNameUnique:false})
        }

        res.json({buzzNameUnique:true})
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
        // console.log(imageArray) 
        user.image=imageArray
        user.save()

        const userid=user._id

        const data={
            user:{
                id:userid
            }
        }

        // Liked To
        let likedTo=[]
        for (let index = 0; index < user.likedTo.length; index++) {
            const userLikedTo=await User.findById(user.likedTo[index])
            likedTo.push(userLikedTo)
        }
        // Liked By
        let likedBy=[]
        for (let index = 0; index < user.likedBy.length; index++) {
            const userLikedBy=await User.findById(user.likedBy[index])
            likedBy.push(userLikedBy)
        }
        // Leftswiped By
        let leftswipedBy=[]
        for (let index = 0; index < user.leftSwipedBy.length; index++) {
            const userleftswipedBy=await User.findById(user.leftSwipedBy[index])
            leftswipedBy.push(userleftswipedBy)
        }
        // Leftswiped To
        let leftswipedTo=[]
        for (let index = 0; index < user.leftSwipedTo.length; index++) {
            const userleftswipedTo=await User.findById(user.leftSwipedTo[index])
            leftswipedTo.push(userleftswipedTo)
        }

        const authtoken=jwt.sign(data,config.JWT_SECRET)
        res.json({"Success":"User Signup Successful",success:true,user:user,authtoken:authtoken,likedTo:likedTo,likedBy:likedBy,leftswipedBy:leftswipedBy,leftswipedTo:leftswipedTo})
    } 
    catch (error) {
        console.log("Internal Server Error "+error)
        res.send("Internal Server Error")
    }
})

// Get User
router.get('/fetchuser',fetchuser,async(req,res)=>{
    try{
        // Getting User Id
        const userid=req.user.id

        // Get User
        let user=await User.findById(userid)

        // User Location Check
        if(user.isDiscoverable && user.isDiscoverableTimeExpires>user.isDiscoverableSetTime){
            // 
            const newData={}
            newData.isDiscoverable=false
            newData.isDiscoverableSetTime=""
            newData.isDiscoverableTimeExpires=""

            // 
            user=await User.findByIdAndUpdate(user._id,{$set:newData},{new:true})
        }

        // Liked To
        let likedTo=[]
        for (let index = 0; index < user.likedTo.length; index++) {
            const userLikedTo=await User.findById(user.likedTo[index])
            likedTo.push(userLikedTo)
        }
        // Liked By
        let likedBy=[]
        for (let index = 0; index < user.likedBy.length; index++) {
            const userLikedBy=await User.findById(user.likedBy[index])
            likedBy.push(userLikedBy)
        }
        // Leftswiped By
        let leftswipedBy=[]
        for (let index = 0; index < user.leftSwipedBy.length; index++) {
            const userleftswipedBy=await User.findById(user.leftSwipedBy[index])
            leftswipedBy.push(userleftswipedBy)
        }
        // Leftswiped To
        let leftswipedTo=[]
        for (let index = 0; index < user.leftSwipedTo.length; index++) {
            const userleftswipedTo=await User.findById(user.leftSwipedTo[index])
            leftswipedTo.push(userleftswipedTo)
        }
        
        res.json({user:user,likedTo:likedTo,likedBy:likedBy,leftswipedBy:leftswipedBy,leftswipedTo:leftswipedTo})
    }
    catch (error) {
        console.log("Internal Server Error "+error)
        res.send("Internal Server Error")
    }
})

// Function To Find Distance Between Two Users
function distance(lat1,lat2, lon1, lon2){
    lon1 =  lon1 * Math.PI / 180;
    lon2 = lon2 * Math.PI / 180;
    lat1 = lat1 * Math.PI / 180;
    lat2 = lat2 * Math.PI / 180;

    // Haversine formula
    let dlon = lon2 - lon1;
    let dlat = lat2 - lat1;
    let a = Math.pow(Math.sin(dlat / 2), 2)
             + Math.cos(lat1) * Math.cos(lat2)
             * Math.pow(Math.sin(dlon / 2),2);
           
    let c = 2 * Math.asin(Math.sqrt(a));

    // Radius of earth in kilometers. Use 3956 for miles
    let r = 6371;

    // calculate the result
    return(c * r * 1000);
}

// Get Nearby Users
router.get('/getNearbyUsers',fetchuser,async(req,res)=>{
    try{
        // Getting User Id
        const userid=req.user.id

        // The User Coordinates
        const theUser=await User.findById(userid)
        var theUserCoordinates = theUser.currentLocation;
        theUserCoordinates = theUserCoordinates.replace(/[\(\)]/g,'').split(',');
        let lat1 = theUserCoordinates[0];
        let lon1 = theUserCoordinates[1];
        // console.log(theUserCoordinates[0]);
        // console.log(theUserCoordinates[1]);

        // Find Nearby Users
        let nearbyUsers=[]
        const discoverableUsers=await User.find({isDiscoverable: true})
        discoverableUsers.map((discoverable)=>{
            if(discoverable._id!=userid){
                // console.log(discoverable._id)
                // console.log(theUser.currentLocation)
                
                var otherUserCoordinates = discoverable.currentLocation;
                otherUserCoordinates = otherUserCoordinates.replace(/[\(\)]/g,'').split(',');
                // console.log(otherUserCoordinates[0]);
                // console.log(otherUserCoordinates[1]);

                let lat2 = otherUserCoordinates[0];
                let lon2 = otherUserCoordinates[1];

                let distanceBetweenUsers=distance(lat1, lat2, lon1, lon2)
                // console.log(distance(lat1, lat2, lon1, lon2) + " metres");
                // console.log(distanceBetweenUsers)

                if(distanceBetweenUsers<=300){
                    nearbyUsers.push(discoverable)
                }
            }
        })

        res.json({nearbyUsers:nearbyUsers})
    }
    catch (error) {
        console.log("Internal Server Error "+error)
        res.send("Internal Server Error")
    }
})

// Get Buzzed With
router.get('/buzzedWith',fetchuser,async(req,res)=>{
    try{
        // Getting User Id
        const userid=req.user.id

        // Getting User
        const myUser=await User.findById(userid)

        // Liked To Users and Liked By Users
        const likedToUsers=myUser.likedTo
        const likedByUsers=myUser.likedBy

        // Buzzed With
        let buzzedWith=[]
        for (let i = 0; i < likedToUsers.length; i++) {
            for (let j = i; j < likedByUsers.length; j++) {
                if(likedToUsers[i]==likedByUsers[j]){
                    buzzedWith.push(likedToUsers[i])
                }
            }
        }

        // Buzzed With Users
        let buzzedWithUsers=[]
        for (let index = 0; index < buzzedWith.length; index++) {
            console.log(buzzedWith[index])
            let theUser=await User.findById(buzzedWith[index])
            console.log(theUser)
            buzzedWithUsers.push(theUser)
        }

        res.json({buzzedWithUsers:buzzedWithUsers})
    }
    catch (error) {
        console.log("Internal Server Error "+error)
        res.send("Internal Server Error")
    }
})

module.exports=router