const express=require('express')
const User=require('../models/User')
var jwt=require('jsonwebtoken')
const fetchuser=require('../middleware/fetchuser')
const config=require('../config.json')

const router=express.Router()

// Set Discoverable True
router.post('/setDiscoverableT',fetchuser,async(req,res)=>{
    try{
        const userid=req.user.id
        const updateDiscoverable=await User.findByIdAndUpdate(userid,{isDiscoverable:true})
        res.json({discoverableUpdated:true,updateDiscoverable})
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