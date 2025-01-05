require("dotenv").config();

const express = require("express");
const connectTODb = require("./dbconnection");
const userRouter = require("./routes/user.route");
const bodyParser = require("body-parser");
const cloudinary = require('cloudinary');
const productRouter = require("./routes/product.route");
const cookieParser = require("cookie-parser");


const app = express();

const port = process.env.PORT;


// connection to db
connectTODb();


cloudinary.config({
     cloud_name:process.env.CLOUDINARY_NAME,
     api_key:process.env.CLOUDINARY_API_KEY,
     api_secret:process.env.CLOUDINARY_API_SECRET     
})

// body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());


app.get('/',(req,res)=>{
     res.send(`<center><h1>Server is Started...</h1></center>`);
})

// route handlers
app.use('/api/v1',userRouter);
app.use('/api/v1',productRouter);


app.listen(port,()=>{
    console.log(`server is running on http://localhost:${port}`);
})
