const User = require('../Model/user.model');
const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const nodemailer = require('nodemailer');
const Otp = require('../Model/otp.model'); // Import the Otp model
require('dotenv')


let otpStore = {};


// Function to create a JWT token
const createToken = (_id) => {
    return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' });
};


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'testemail23mca20049@gmail.com',
      pass: process.env.PASSWORD
    }
  });
// User signup function
const signupUser = async (req, res) => {
    try {
        const { username, email, password, phone } = req.body;
        const photo = req.file.path
        const cloudStore = await cloudinary.uploader.upload(req.file.path)
        console.log(username, email, password);

        // Ensure all required fields are provided
        if (!username || !email || !password || !phone) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate email and password
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: 'Email is not valid' });
        }
        if (!validator.isStrongPassword(password)) {
            return res.status(400).json({ message: 'Password is not strong enough' });
        }

        // Check if the email already exists
        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // Create a new user document
        const user = new User({
            username,
            email,
            password: hash,
            phone,
            profile:cloudStore.secure_url
            // Assuming you are not using 'photo' in this example
        });

        const result = await user.save();
        const token = createToken(result._id);
        if(result && token)
        {
            const mailOptions = {
                from: 'testemail23mca20049@gmail.com',
                to: email,
                subject: 'Welcome to LEARNIGO',
                html: `
                  <div style="background-image: url('https://via.placeholder.com/600x200'); background-size: cover; padding: 20px; text-align: center;">
                    <h1 style="color: white;">Welcome to LEARNIGO, ${result.username}</h1>
                    <p style="color: white;">Thank you for choosing LEARNIGO! We're excited to have you on board.</p>
                  </div>
                  <div style="text-align: center; margin-top: 20px;">
                    <p>Learningo will provide the best experience in term of the language knowledge:</p>
                    <img src="cid:unique@learnigo.image" alt="Welcome Image" style="width: 300px; height: auto;">

                  </div>
                `,
                attachments: [
                  {
                    filename: 'welcome-image.jpg',
                    path: result.profile,  // Update with the correct path to your image
                    cid: 'unique@learnigo.image' // Same as used in the 'img' tag in the HTML
                  }
                ]
              };
              
              transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });
              
            
              // Send a success response
              res.status(201).json({ user, token });
        }

    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// User login function
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Ensure all required fields are provided
        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate email
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: 'Email is not valid' });
        }

        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Incorrect email' });
        }

        // Compare the password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ message: 'Incorrect password' });
        }
        console.log(user)
        const token = createToken(user._id);
     
        res.status(200).json({ user, token });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    console.log(id);
    

    try {
        const result = await User.findByIdAndDelete(id);

        if (result) {
            return res.status(200).json({
                message: `User with id ${id} deleted successfully.`,
            });
        } else {
            return res.status(404).json({
                message: `User with id ${id} not found.`,
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'An error occurred while deleting the user.',
        });
    }
};




const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the email exists in the User collection
    const exists = await User.findOne({ email });
    if (!exists) {
      return res.status(400).json({ message: 'Email does not exist' });
    }

    // Generate a 6-digit OTP
    let otp = '';
    for (let i = 0; i < 6; i++) {
      otp += Math.floor(Math.random() * 10); // Generates a random digit from 0-9
    }

    // Calculate the OTP expiration time (10 minutes from now)
    const otpExpires = Date.now() + 10 * 60 * 1000;

    // Store the OTP in the OTP collection
    await Otp.create({
      email: email,
      otp: otp,
      otpExpires: otpExpires,
    });

    // Send the OTP to the user's email (your email sending code)
    const mailOptions = {
            from: 'testemail23mca20049@gmail.com',
            to: email,
            subject: 'OTP to reset the password of the LEARNIGO account',
            html: `
              <div style="background-image: url('https://via.placeholder.com/600x200'); background-size: cover; padding: 20px; text-align: center;">
                <h1 style="color: white;">Welcome to LEARNIGO, ${exists.username}</h1>
                <p style="color: white;">Thank you for choosing LEARNIGO! We're excited to have you on board.</p>
              </div>
              <div style="text-align: center; margin-top: 20px;">
                <p>OTP for resetting your LEARNIGO account password is ${otp}</p>
                <img src="cid:unique@learnigo.image" alt="Welcome Image" style="width: 300px; height: auto;">
              </div>
            `,
            attachments: [
              {
                filename: 'welcome-image.jpg',
                path: exists.profile, // Update with the correct path to your image
                cid: 'unique@learnigo.image' // Same as used in the 'img' tag in the HTML
              }
            ]
          };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to send email' });
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    return res.status(200).json({ message: 'OTP sent to your email' });
  } catch (err) {
    console.error('Error in forgetPassword:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { otpValue, email } = req.body;

    // Find the OTP document for the given email
    const otpDoc = await Otp.findOne({ email, otp: otpValue });

    if (!otpDoc) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check if the OTP is still valid (not expired)
    if (otpDoc.otpExpires > Date.now()) {
      // OTP is valid
      return res.status(200).json({ value: true });
    } else {
      // OTP is expired
      return res.status(400).json({ message: 'OTP expired' });
    }
  } catch (err) {
    console.error('Error in verifyOtp:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updatePassword = async(req,res)=>{

    const email = otpStore['useremail']

    const {newPassword} = req.body;
    try {
        // Find the user by email
        const user = await User.findOne({ email });
        // if (!user) {
        //     return res.status(404).json({ message: 'User not found' });
        // }

        // Check if the current password matches
        // const isMatch = await bcrypt.compare(currentPassword, user.password);
        // if (!isMatch) {
        //     return res.status(400).json({ message: 'Current password is incorrect' });
        // }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        
        // Update the password
        user.password = hashedNewPassword;
        await user.save();
        otpStore['useremail'] ="";
        otpStore['userotp'] = "";

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { signupUser, loginUser,deleteUser,forgetPassword,verifyOtp,updatePassword };

// this code is written for the future purpose and will be used in the future purpose
// const image = new Image({
//     publicId: result.public_id,
//     url: result.secure_url,
//     format: result.format,
//     createdAt: result.created_at,
//   });
