const express=require('express')
const User=require('../models/User')
var jwt=require('jsonwebtoken')
const fetchuser=require('../middleware/fetchuser')
const config=require('../config.json')

const router=express.Router()

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

    // Radius of earth in kilometers. Use 3956
    // for miles
    let r = 6371;

    // calculate the result
    return(c * r * 1000);
}

// Set Discoverable True
router.post('/setDiscoverableT',fetchuser,async(req,res)=>{
    try{
        const userid=req.user.id
        const updateDiscoverable=await User.findByIdAndUpdate(userid,{isDiscoverable:true})

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
                    nearbyUsers.push(discoverable._id)
                }
            }
        })

        res.json({discoverableUpdated:true,updateDiscoverable,nearbyUsers:nearbyUsers})
    }
    catch (error) {
        console.log("Internal Server Error "+error)
        res.send("Internal Server Error")
    }
})

// Set Discoverable False
router.post('/setDiscoverableF',fetchuser,async(req,res)=>{
    try{
        const userid=req.user.id
        const updateDiscoverable=await User.findByIdAndUpdate(userid,{isDiscoverable:false})
        res.json({discoverableUpdated:true,updateDiscoverable})
    }
    catch (error) {
        console.log("Internal Server Error "+error)
        res.send("Internal Server Error")
    }
})

// Set Current Location
router.post('/setCurrentLocation',fetchuser,async(req,res)=>{
    try{
        let userCurrentLocation=req.body.currentLocation
        const userid=req.user.id
        const setCurrentLocation=await User.findByIdAndUpdate(userid,{currentLocation:userCurrentLocation})
        res.json({cuurentLocationSet:true,})
    }
    catch (error) {
        console.log("Internal Server Error "+error)
        res.send("Internal Server Error")
    }
})

module.exports=router