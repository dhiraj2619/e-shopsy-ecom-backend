const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const cloudinary = require("cloudinary");
const Product = require('../models/product.model');
const { search, filter, pagination } = require('../utils/searchQuery');

// Add new product
const addProduct = asyncErrorHandler(async (req, res, next) => {
    console.log("Body received:", req.body);
    console.log("Files received:", req.files);

    try {
        // Sanitize the request body keys
        const sanitizedBody = {};
        for (const key in req.body) {
            sanitizedBody[key.trim()] = req.body[key];
        }

        // Extract sanitized fields
        const { name, description, price, cuttedPrice, category, stock, warranty } = sanitizedBody;

        // Check for required fields
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Product name is required",
            });
        }


        const brandName = sanitizedBody['brand[name]'] || sanitizedBody['brand.name'] || req.body.brand?.name;
        if (!brandName) {
            return res.status(400).json({
                success: false,
                message: "Brand name is required",
            });
        }

        // Check if the brand logo is provided
        if (!req.files || !req.files['brand.logo']?.length) {
            return res.status(400).json({
                success: false,
                message: "Brand logo is required",
            });
        }

        if (!req.files || !req.files['images']?.length) {
            return res.status(400).json({
                success: false,
                message: "image is required"
            })
        }

        // Upload brand logo to Cloudinary
        const logoFile = req.files['brand.logo'][0];
        const logoResult = await cloudinary.v2.uploader.upload(logoFile.path, {
            folder: "brands",
        });

        const productImages = [];

        for (const imageFile of req.files['images']) {
            const imageResult = await cloudinary.v2.uploader.upload(imageFile.path, {
                folder: 'products'
            });

            productImages.push({
                public_id: imageResult.public_id,
                url: imageResult.secure_url
            })
        }


        const brandLogo = {
            public_id: logoResult.public_id,
            url: logoResult.secure_url,
        };



        // Parse JSON fields for highlights and specifications
        const parsedSpecifications = sanitizedBody.specifications
            ? JSON.parse(sanitizedBody.specifications).map((spec) => ({
                title: spec.title,
                description: spec.description,
            }))
            : [];

        const parsedHighlights = sanitizedBody.highlights ? JSON.parse(sanitizedBody.highlights) : [];

        // Create new product entry
        const product = await Product.create({
            name,
            description,
            highlights: parsedHighlights,
            specifications: parsedSpecifications,
            price,
            cuttedPrice,
            category,
            stock,
            warranty,
            images: productImages,
            brand: {
                name: brandName,
                logo: brandLogo,
            },
            user: req.user.id, // Assuming req.user.id is the authenticated user's ID
        });

        res.status(201).json({
            success: true,
            data: product,
        });
    } catch (error) {
        console.error("Error in addProduct:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while adding the product.",
            error: error.message,
        });
    }
});


const updateProduct = asyncErrorHandler(async (req, res, next) => {
    const productId = req.params.id;
    try {

        const product = await Product.findById(productId);

        if (!product) {
            res.status(400).json({
                sucess: false,
                message: "product not found with this id"
            })
        }

        const updates = {}

        const { name, description, price, cuttedPrice, category, stock, warranty } = req.body;

        if (name) updates.name = name;
        if (description) updates.description = description;
        if (price) updates.price = price;
        if (cuttedPrice) updates.cuttedPrice = cuttedPrice;
        if (category) updates.category = category;
        if (stock) updates.stock = stock;
        if (warranty) updates.warranty = warranty;


        if (req.files && req.files['brand.logo']?.length) {
            if (product.brand.logo?.public_id) {
                await cloudinary.v2.uploader.destroy(product.brand.logo?.public_id);
            }

            const logoFile = req.files['brand.logo'][0];
            const logoResult = await cloudinary.v2.uploader.upload(logoFile.path, {
                folder: 'brands'
            });


            updates.brand = {
                ...product.brand,
                logo: {
                    public_id: logoResult.public_id,
                    url: logoResult.secure_url
                }
            }
        }

        if (req.files && req.files['product.images']?.length) {
            for (const image of product.images) {
                await cloudinary.v2.uploader.destroy(image.public_id);
            }

            const productImages = [];
            for (const imageFile of req.files['images']) {
                const imageResult = await cloudinary.v2.uploader.upload(imageFile.path, {
                    folder: 'products'
                });

                productImages.push({
                    public_id: imageResult.public_id,
                    url: imageResult.secure_url
                });
            }

            updates.images = productImages;
        }

        if (req.body.highlights) {
            updates.highlights = JSON.parse(req.body.highlights);
        }

        if (req.body.specifications) {
            updates.specifications = JSON.parse(req.body.specifications).map((spec) => ({
                title: spec.title,
                description: spec.description
            }));
        }

        const updatedProduct = await Product.findByIdAndUpdate(productId, updates, {
            new: true,
            runValidators: true,
        })

        res.status(200).json({
            success: true,
            data: updatedProduct,
            message: 'product updated'
        })
    } catch (error) {
        console.error("Error in updateProduct:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while updating the product.",
            error: error.message,
        });
    }
})

const getAllProducts = asyncErrorHandler(async (req, res, next) => {
    try {
        const resultsPerPage = 12;
        const productsCount = await Product.countDocuments();

        let query = Product.find();

        query = search(query, req.query);

        query = filter(query, req.query);

        let products = await query;

        const filteredProductsCount = products.length;

        query = pagination(query, req.query, resultsPerPage);


        products = await query.clone();

        res.status(200).json({
            products, productsCount, resultsPerPage, filteredProductsCount
        })
    } catch (error) {
        console.error(error);
        res.status(400).json("error", "error occured");
    }
})


const getProducts = asyncErrorHandler(async (req, res, next) => {
    try {
        const products = await Product.find();

        res.status(200).json({
            success: true,
            products
        })
    } catch (error) {
        console.error(error);

    }
})

module.exports = { addProduct, updateProduct, getAllProducts,getProducts };
