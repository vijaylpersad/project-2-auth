const express = require('express') // import express
const app = express() // create an express instance
const ejsLayouts = require('express-ejs-layouts') // import ejs layouts
require('dotenv').config() // allows us to access env vars
const cookieParser = require('cookie-parser')
const cryptoJS = require('crypto-js')
const db = require('./models/index.js')

// MIDDLEWARE
app.set('view engine', 'ejs') // set the view engine to ejs
app.use(ejsLayouts) // tell express we want to use layouts
app.use(cookieParser()) //gives us acces to req.cookies
app.use(express.urlencoded({extended: false})) // body parser to make req.body work

//custom login middleware
app.use(async (req, res, next)=>{
    if(req.cookies.userId){
    const decryptedId = cryptoJS.AES.decrypt(req.cookies.userId, process.env.SECRET) //decrypt incoming user id from cookie
    const decryptedIdString = decryptedId.toString(cryptoJS.enc.Utf8) //convert decrytid to readable string
    const user = await db.user.findByPk(decryptedIdString) //query database for user with that id 
    res.locals.user = user  //this makes user universally available in views files... res.locals.taco ... taco used in ejs
    } else res.locals.user = null
    next() //move on to next piece of middleware
})

//controllers middleware
app.use('/users', require('./controllers/users.js'))

// ROUTES
app.get('/', (req, res)=>{
    res.render('home.ejs')
})




// check for an env PORT, otherwise use 8000
const PORT = process.env.PORT || 8000
app.listen(PORT, ()=>{
    console.log(`Auth app running on ${PORT}`)
})
