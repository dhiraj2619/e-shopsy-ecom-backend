const User = require('../models/user.model');
const cloudinary = require("cloudinary");
const sendToken = require('../utils/sendToken');
const ErrorHandler = require('../utils/Errorhandler');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const nodemailer= require("nodemailer");

const registerUser = asyncErrorHandler(async (req, res, next) => {
    try {
        const { name, email, password, gender } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No image file uploaded" });
        }

        const myCloud = await cloudinary.v2.uploader.upload(req.file.path, {
            folder: "avatars",
            width: 150,
            crop: "scale"
        });

        const user = await User.create({
            name,
            email,
            password,
            gender,
            avatar: {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        });

        sendToken(user, 201, res);
    } catch (error) {
        console.error("Error in registerUser:", error);
        res.status(500).json({ success: false, message: "An error occurred", error: error.message });
    }
});

const loginUser = asyncErrorHandler(async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ErrorHandler("Please enter email and password", 400))
        }

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return next(new ErrorHandler("User with this email not exists", 401))
        }

        const passwordMatch = await user.comparePassword(password);

        if (!passwordMatch) {
            return next(new ErrorHandler("Incorrect password", 401))
        }

        sendToken(user, 200, res);
    } catch (error) {
        console.error(error);
    }
});

const logoutUser = asyncErrorHandler(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: "logged out"
    })
})



const getUserDetails = asyncErrorHandler(async (req, res) => {

    const UserId = req.user.id;

    const user = await User.findById(UserId);

    return res.status(200).json({
        success: true,
        data: user
    });
})


const forgotPassword = asyncErrorHandler(async (req, res) => {

    const { email } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: "user not exists" });

        }

        const resetToken = await user.getResetPasswordToken();


        await user.save({ validateBeforeSave: false });

        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const resetUrl = `http://localhost:${process.env.PORT}/password/reset/${resetToken}`;

        const message = `
       <p>Dear ${user.name},</p>
       <p>You have requested to reset your password. Click on the link below to reset your password:</p>
       <a href="${resetUrl}" target="_blank">${resetUrl}</a>
       <p>If you did not request this, please ignore this email.</p>
   `;


        await transporter.sendMail({
            from: `Support team <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "password reset request",
            html: message,
        })

        return res.status(201).json({
            success: true,
            message: `Password reset email sent to ${user.email}`,
        });

    } catch (error) {
        console.error(error);

        // Send error response
        res.status(500).json({
            success: false,
            message: "There was an error sending the email. Try again later.",
        });
    }
});


const updateUserRole=asyncErrorHandler(async(req,res,next)=>{
     try {
          const newUserData ={
             name:req.body.name,
             email:req.body.email,
             gender:req.body.gender,
             role:req.body.role
          };

          await User.findByIdAndUpdate(req.params.id,newUserData,{
            new: true,
            runValidators: true,
            useFindAndModify: false,
          })
          res.status(200).json({
            success: true,
        });
     } catch (error) {
         console.error(error);
         
         res.status(400).json("failed to update user role")
     }
})

module.exports = { registerUser, loginUser, logoutUser, getUserDetails,forgotPassword,updateUserRole };