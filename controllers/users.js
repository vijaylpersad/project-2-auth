const express = require('express')
const { route } = require('express/lib/application')
const router = express.Router()
const db = require('../models')
const bcrypt = require('bcrypt')
const cryptojs = require('crypto-js')
require('dotenv').config()

router.get('/profile', (req,res)=>{
    res.render('users/profile.ejs')
})

router.get('/new', (req,res)=>{
    res.render('users/new.ejs')
})

router.post('/', async (req,res)=>{
    const [newUser, created] = await db.user.findOrCreate({  //returns two values --if item searched is real u get that plus a boolean true or false
        where: {email: req.body.email}
    })
    if(!created) { // if user already existts aka wasnt created 
        console.log('user already exists')
        //render the Log in Page with appropriate message ie acct already exists 
    } else {
        const hashedPassword = bcrypt.hashSync(req.body.password, 10)   
        newUser.password = hashedPassword
        await newUser.save()


        //encrpyt user id via AES advanced encrpy standard  -- use pckge crpto js 
        const encryptedUserId = cryptojs.AES.encrypt(newUser.id.toString(), process.env.SECRET)
        const encryptedUserIdString = encryptedUserId.toString()
        console.log(encryptedUserIdString)
        //store encrypted id in the cookie of the res obj 
        res.cookie('userId', encryptedUserIdString)
        //redircet to home page
        res.redirect('/')
    }
})

router.get('/login', (req,res)=>{
    res.render('users/login.ejs', {error: null})
})

router.post('/login', async (req,res)=>{
    const user = await db.user.findOne({
        where: {
            email: req.body.email
        }
    })
    if(!user){
        console.log('user not found!')
        res.render('users/login.ejs', 
        {
            error: 'invalid email or password'
        })
    } else if(!bcrypt.compareSync(req.body.password, user.password)) {   //user from database
        console.log('incorrect password')
        res.render('users/login.ejs', 
        {
            error: 'invalid email or password'
        })
    } else {
        console.log('logging user in')
        const encryptedUserId = cryptojs.AES.encrypt(user.id.toString(), process.env.SECRET) // second argument is secret 
        const encryptedUserIdString = encryptedUserId.toString()
        console.log(encryptedUserIdString)
        //store encrypted id in the cookie of the res obj 
        res.cookie('userId', encryptedUserIdString) //new key value pair userid : encr..
        //redircet to home page
        res.redirect('/')
    }

})

router.get('/logout', (req,res)=>{
    console.log('logging out')
    res.clearCookie('userId')
    res.redirect('/')
})
module.exports = router


