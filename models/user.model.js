const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true
    },
    gender: {
        type: String,
        required: [true, "Please enter gender"]
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minLength: [8, "Password should have atleast 8 chars"],
        select: false,
    },
    avatar:{
        public_id:{
            type:String
        },
        avatar:{
            type:String
        }
    },
    role:{
        type:String,
        default:'user'
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
    resetPasswordToken:String,
    resetPasswordExpires:Date
    
});

userSchema.pre("save",async function(next){
   if(!this.isModified("password")){
      next();
   }
   this.password = await bcrypt.hash(this.password,10);
})

userSchema.methods.getJWTToken = function(){
    return jwt.sign(
        {id:this._id},
        process.env.JWT_SECRET,
        {expiresIn:process.env.JWT_EXPIRES}
    )}

userSchema.methods.comparePassword = async function(enteredPassword){
   return await bcrypt.compare(enteredPassword,this.password);
}

userSchema.methods.getResetPasswordToken= async function(){
   const resetToken = crypto.randomBytes(20).toString("hex");

   this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
   this.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

   return resetToken;
}

module.exports = mongoose.model('User',userSchema);