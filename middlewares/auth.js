const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const ErrorHandler = require('../utils/Errorhandler');
const asyncErrorHandler = require('./asyncErrorHandler');

const isAuthenticatedUser =asyncErrorHandler(async(req,res,next)=>{

    const {token} = req.cookies;
    console.log(token);
    
    if(!token){
         return next(new ErrorHandler("Please login to access",401));
    }

    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();

})


module.exports = {isAuthenticatedUser}