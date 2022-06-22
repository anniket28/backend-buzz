// Require
const express=require('express')
const User=require('../models/User')
const fetchuser=require('../middleware/fetchuser')
const multer=require('multer')
const { v4: uuidv4 } = require('uuid');
const fs=require('fs')
var cron = require('node-cron');

// 
cron.schedule('*/30 * * * *', async() => {
    console.log("30 minutes")
    // 
    let user=await User.find({isDiscoverable:true,$expr: { $gt: [ "$isDiscoverableTimeExpires" , "$isDiscoverableSetTime" ] } })

    // 
    if(user.length){
        const newData={}
        newData.isDiscoverable=false
        newData.isDiscoverableSetTime=""
        newData.isDiscoverableTimeExpires=""
    
        // 
        for (let index = 0; index < user.length; index++) {
            let updateUser=await User.findByIdAndUpdate(user[index]._id,{$set:newData},{new:true})
            console.log("Updated")
        }
    }
});

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

// // Function To Find Distance Between Two Users
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

// Edit User Data
router.post('/editUserData',fetchuser,upload.array('images',5),async(req,res)=>{
    try{
        // Getting User Id
        const userid=req.user.id

        // Get User Details
        const myUser=await User.findById(userid)

        // Getting all values
        const {phoneNumber,fullName,buzzName,dateOfBirth,gender,interests,bio,country,city,profession,email}=req.body

        // Creating new data
        const newData={}
        let imageArray=[]

        // If value to be changed replace with new value
        if(phoneNumber){newData.phone_number=phoneNumber}
        if(fullName){newData.full_name=fullName}
        if(buzzName){newData.buzz_name=buzzName}
        if(dateOfBirth){newData.date_of_birth=dateOfBirth}
        if(gender){newData.gender=gender}
        if(interests){newData.interests=interests}
        if(bio){newData.bio=bio}
        if(country){newData.country=country}
        if(city){newData.city=city}
        if(profession){newData.profession=profession}
        if(email){newData.email=email}

        // console.log(req.files.length)
        if(req.files.length>0){
            // Storing new images
            for (let index = 0; index < req.files.length; index++) {
                imageArray.push(req.files[index].path)
            }
            newData.image=imageArray
            // console.log(imageArray)

            // Deleting old images
            for (let index = 0; index < myUser.image.length; index++) {
                const imagePath=myUser.image[index]
                try {
                    // console.log(imagePath)
                    fs.unlinkSync(imagePath)
                } catch (error) {
                    console.log(error)
                }
            }
        } 

        const editUserData=await User.findByIdAndUpdate(userid,{$set:newData},{new:true})

        res.json({updatedSuccessfully:true,editUserData:editUserData})
    }
    catch (error) {
        console.log("Internal Server Error "+error)
        res.send("Internal Server Error")
    }
})

// Set Discoverable True
router.post('/setDiscoverableT',fetchuser,async(req,res)=>{
    try{
        //  Getting User Id
        const userid=req.user.id

        // Setting isDiscoverable to true
        const newData={}
        newData.isDiscoverable=true
        newData.isDiscoverableSetTime=Date.now()
        newData.isDiscoverableTimeExpires=Date.now()+(60*60*1000)

        const updateDiscoverable=await User.findByIdAndUpdate(userid,{$set:newData},{new:true})

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

        res.json({discoverableUpdatedToTrue:true,updateDiscoverable:updateDiscoverable,nearbyUsers:nearbyUsers})
    }
    catch (error) {
        console.log("Internal Server Error "+error)
        res.send("Internal Server Error")
    }
})

// Set Discoverable False
router.post('/setDiscoverableF',fetchuser,async(req,res)=>{
    try{
        // Getting User Id
        const userid=req.user.id

        // Setting isDiscoverable to false
        const newData={}
        newData.isDiscoverable=false
        newData.isDiscoverableSetTime=""
        newData.isDiscoverableTimeExpires=""

        const updateDiscoverable=await User.findByIdAndUpdate(userid,{$set:newData},{new:true})

        res.json({discoverableUpdatedToFalse:true,updateDiscoverable:updateDiscoverable})
    }
    catch (error) {
        console.log("Internal Server Error "+error)
        res.send("Internal Server Error")
    }
})

// Set Current Location
router.post('/setCurrentLocation',fetchuser,async(req,res)=>{
    try{
        // Getting User Id
        const userid=req.user.id

        // Setting currentLocation
        const newData={}
        newData.currentLocation=req.body.currentLocation

        const setCurrentLocation=await User.findByIdAndUpdate(userid,{$set:newData},{new:true})

        res.json({currentLocationSet:true,setCurrentLocation:setCurrentLocation})
    }
    catch (error) {
        console.log("Internal Server Error "+error)
        res.send("Internal Server Error")
    }
})

// Liked By
router.post('/like/:id',fetchuser,async(req,res)=>{
    try{
        // Getting User Id
        const userid=req.user.id

        // 
        const userLiking=await User.findById(userid)
        const userToLike=await User.findById(req.params.id)
        if(userLiking.likedTo.includes(userid)){
            res.json({likedPreviously: true})
        }
        else{
            const updateLikedBy=await User.findByIdAndUpdate(req.params.id,{$push:{likedBy:userid}},{new:true})
            const updateLikedTo=await User.findByIdAndUpdate(userid,{$push:{likedTo:req.params.id}},{new:true})
            res.json({likedSuccessfully:true,likedToSaved:true,updateLikedTo,updateLikedBy})
        }

    }
    catch (error) {
        console.log("Internal Server Error "+error)
        res.send("Internal Server Error")
    }
})

// Left Swiped
router.post('/leftSwipe/:id',fetchuser,async(req,res)=>{
    try{
        // Getting User Id
        const userid=req.user.id

        // 
        const userLeftSwiping=await User.findById(userid)
        const userToLeftSwiped=await User.findById(req.params.id)
        if(userLeftSwiping.leftSwipedTo.includes(req.params.id)){
            res.json({leftSwipedPreviously: true})
        }
        else{
            const updatLeftSwipedBy=await User.findByIdAndUpdate(req.params.id,{$push:{leftSwipedBy:userid}},{new:true})
            const updateLeftSwipedTo=await User.findByIdAndUpdate(userid,{$push:{leftSwipedTo:req.params.id}},{new:true})
            res.json({leftSwipedSuccessfully:true,leftSwipedSaved:true,updateLeftSwipedTo,updatLeftSwipedBy})
        }

    }
    catch (error) {
        console.log("Internal Server Error "+error)
        res.send("Internal Server Error")
    }
})

module.exports=router