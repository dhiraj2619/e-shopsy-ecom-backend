const mongoose = require("mongoose");

const connectTODb =async()=>{
    try {
       await mongoose.connect(process.env.MONGO_URI);
       console.log("connected to db");
    } catch (error) {
        console.error(error);
        
    }
}

module.exports = connectTODb;