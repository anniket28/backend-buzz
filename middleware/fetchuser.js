var jwt=require('jsonwebtoken')
const config=require('../config.json')

const fetchuser=(req,res,next)=>{
    const token=req.header('auth-token')
    if(!token){
        res.status(401).send({error:"Invalid Token"})
    }
    try {
        const data=jwt.verify(token,config.JWT_SECRET)
        req.user=data.user
        next()
    } catch (error) {
        res.status(401).send({error:'Invalid Token'})
    }
}

module.exports=fetchuser