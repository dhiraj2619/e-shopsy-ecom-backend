function ErrorHandler(message,statusCode){
    const error = new Error(message);

    error.statusCode = statusCode;
    Error.captureStackTrace(error,ErrorHandler);

    return error;
}


const authorizeRoles=(...roles)=>{
    return(req,res,next)=>{
         if(!roles.includes(req.user.role)){
             return next(new ErrorHandler(`Role ${req.user.role} is not allowed`,403));
         }
         next();
    }
}
module.exports = {ErrorHandler,authorizeRoles};