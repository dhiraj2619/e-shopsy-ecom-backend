const express = require("express");
const userController = require('../controllers/user.controller');
const upload = require('../middlewares/multerConfig');
const { isAuthenticatedUser } = require("../middlewares/auth");
// const { isAuthenticatedUser } = require('../middlewares/auth');


const userRouter = express.Router();

userRouter.post("/register", upload.single("avatar"), userController.registerUser);
userRouter.post("/login",userController.loginUser);
userRouter.get("/logout",userController.logoutUser);
// userRouter.get('/mydetail',isAuthenticatedUser,userController.getUserDetails);
userRouter.post('/password/forgot',userController.forgotPassword);

userRouter.put('/admin/user/:id',isAuthenticatedUser,userController.updateUserRole);

module.exports = userRouter;