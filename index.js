require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const app = express()
const signupRoutes = require('./Routes/user.routes')
const paymentRoutes = require('./Routes/stripe.route')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/users',signupRoutes)
app.use('/payment',paymentRoutes);
app.use(cors())
// app.get('/',(req,res)=>{

//     res.send("The server is working ")
// })
app.get("/",(req,res)=>{
    res.send("system is working fine")
})

mongoose.connect(process.env.URI)
.then(()=>{
    console.log("The data base is conected to mongodb");
  
})
.catch((error)=>{
    console.log("This is something error in the connection",error);
})

app.listen(process.env.PORT,()=>{
    console.log("The system is working fine on port ",process.env.PORT);
})    
