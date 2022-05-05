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
        type: String,
        default: ""
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
    buzzedBy:{
        type: Array
    },
    buzzedByTime:{
        type: Array
    },
    buzzedTo:{
        type: Array
    },
    buzzedToTime:{
        type: Array
    },
    isDiscoverable:{
        type: Boolean
    },
    isAlreadyLoggedIn:{
        type: Boolean
    },
    buzzLine:{
        type: String
    },
    isPremium:{
        type: Boolean
    },
    likdBy:{
        type: Array
    },
    likdByTime:{
        type: Array
    },
    likedTo:{
        type: Array
    },
    likedToTime:{
        type: Array
    },
    date_user_created:{
        type: Date,
        default:Date.now
    },
})

module.exports=mongoose.model('users',UserSchema)