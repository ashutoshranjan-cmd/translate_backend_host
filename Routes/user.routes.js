const express = require('express')
const {signupUser,loginUser,deleteUser,forgetPassword,verifyOtp,updatePassword} = require('../Controllers/user.controller')
const upload = require('../Middleware/multer')
const router = express.Router()



router.post('/signup',upload.single('photo'),signupUser)

router.post('/login',loginUser)


router.delete('/delete/:id',deleteUser)

router.post('/forget',forgetPassword)
router.post('/verify',verifyOtp)
router.put('/update',updatePassword)



module.exports = router