// Require
const express=require('express')
const User=require('../models/User')
var jwt=require('jsonwebtoken')
const fetchuser=require('../middleware/fetchuser')
const config=require('../config.json')

// Router
const router=express.Router()

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
router.post('/editUserData',fetchuser,async(req,res)=>{
    try{
        // Getting User Id
        const userid=req.user.id

        // Getting all values
        const {phoneNumber,fullName,buzzName,dateOfBirth,gender,interests,bio,country,city,profession,email}=req.body

        // Creating new data
        const newData={}

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
        if(userToLike.likedBy.includes(userid)){
            res.json({likedPreviously: true})
        }
        else{
            const updateLikedBy=await User.findByIdAndUpdate(req.params.id,{$push:{likedBy:userid}})
            const updateLikedTo=await User.findByIdAndUpdate(userid,{$push:{likedTo:req.params.id}})
            res.json({likedSuccessfully:true,likedToSaved:true,updateLikedBy})
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
            const updatLeftSwipedBy=await User.findByIdAndUpdate(req.params.id,{$push:{leftSwipedBy:userid}})
            const updateLeftSwipedTo=await User.findByIdAndUpdate(userid,{$push:{leftSwipedTo:req.params.id}})
            res.json({leftSwipedSuccessfully:true,leftSwipedSaved:true,updateLeftSwipedTo})
        }

    }
    catch (error) {
        console.log("Internal Server Error "+error)
        res.send("Internal Server Error")
    }
})

module.exports=router