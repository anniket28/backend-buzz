const mongoose=require('mongoose')

const UserSchema=new mongoose.Schema({
    phone_number:{
        type: String
    },
    full_name:{
        type: String
    },
    buzz_name:{
        type: String
    },
    date_of_birth:{
        type: String
    },
    gender:{
        type: String
    },
    image:{
        type: Array
    },
    interests:{
        type: Array,
        default: []
    },
    bio:{
        type: String,
        default: ""
    },
    country:{
        type: String,
        default: ""
    },
    city:{
        type: String,
        default: ""
    },
    profession:{
        type: String,
        default: ""
    },
    email:{
        type: String,
        default: ""
    },
    isDiscoverable:{
        type: Boolean,
        default: false
    },
    isDiscoverableSetTime:{
        type: String,
        default: ""
    },
    isDiscoverableTimeExpires:{
        type: String,
        default: ""
    },
    isAlreadyLoggedIn:{
        type: Boolean,
        default: true
    },
    buzzLine:{
        type: String
    },
    isPremium:{
        type: Boolean,
        default: false
    },
    likedBy:{
        type: Array,
        default: []
    },
    likedTo:{
        type: Array,
        default: []
    },
    leftSwipedTo:{
        type: Array,
        default: []
    },
    leftSwipedBy:{
        type: Array,
        default: []
    },
    buzzedWith:{
        type: Array,
        default: []
    },
    currentLocation:{
        type: String,
        default: ""
    },
    date_user_created:{
        type: Date,
        default:Date.now
    },
})

module.exports=mongoose.model('users',UserSchema)