// Require
const {urlencoded}=require('express')
const connection=require('./database')
const express=require('express')
const cors=require('cors')

// App
const app=express()
const port=process.env.PORT || 4000

// Use
app.use('/static',express.static('static'))
app.use(express.json())
app.use(cors())
app.use(urlencoded({extended: false}))

// User Authentication
app.use('/api/auth',require('./routers/Auth'))
app.use('/api/update',require('./routers/Update'))
app.use('/api/interest',require('./routers/Interest'))

// App Run
app.listen(port,()=>{
    console.log("App Running at "+ port)
})