const express = require('express');
const { addProduct, updateProduct, getAllProducts, getProducts } = require('../controllers/product.controller');
const { isAuthenticatedUser } = require('../middlewares/auth');
const upload = require('../middlewares/multerConfig');
const { authorizeRoles } = require('../utils/Errorhandler');

const productRouter = express.Router();

// Route to add a new product
productRouter.post(
    '/admin/product/new',
    isAuthenticatedUser,
    authorizeRoles("admin"),
    upload.fields([
        { name: "brand.logo", maxCount: 1 }, // Handle single logo only
        { name: "images", maxCount: 5 }, // Handle up to 10 product images
    ]),
    addProduct // Controller to handle product creation
);

productRouter.put('/admin/product/:id',isAuthenticatedUser,authorizeRoles('admin'),
   upload.fields([
     {name:"brand.logo",maxCount:1},
     {name:"images",maxCount:5},
   ]),updateProduct
);

productRouter.get('/products',getAllProducts);
productRouter.get('/products/all',getProducts);

module.exports = productRouter;
