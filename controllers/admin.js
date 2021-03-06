const { validationResult } = require('express-validator');
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        isAuthenticated: req.session.isLoggedIn,
        hasError: false,
        errorMessage: '',
        validationErrors: [],
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    const sale_enabled = req.body.sale_enabled === 'on' ? true : false;
    const sale_price = parseFloat(req.body.sale_price);

    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: req.user,
        sale: { active: sale_enabled, saleAmount: sale_price },
    });
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            isAuthenticated: req.session.isLoggedIn,
            hasError: true,
            product: {
                title: title,
                imageUrl: imageUrl,
                price: price,
                description: description,
                sale: { active: sale_enabled, saleAmount: sale_price },
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
        });
    }
    product
        .save()
        .then((result) => {
            // console.log(result);
            console.log('Created Product');
            res.redirect('/admin/products');
        })
        .catch((err) => {
            console.log(err);

            const error = new Error(err);
            error.httpStatuseCode = 500;
            return next(error);
        });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: false,
            isAuthenticated: req.session.isLoggedIn,
            hasError: true,
            product: {
                _id: prodId,
                title: req.body.title,
                imageUrl: req.body.imageUrl,
                price: req.body.price,
                description: req.body.description,
                sale: {
                    active: req.body.sale_enabled,
                    saleAmount: req.body.sale_price,
                },
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
        });
    }
    Product.findById(prodId)
        .then((product) => {
            if (!product) {
                console.log(err);

                return res.redirect('/');
            }
            return res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                product: product,
                isAuthenticated: req.session.isLoggedIn,
                hasError: false,
                errorMessage: '',
                validationErrors: errors.array(),
            });
        })
        .catch((err) => {
            console.log(err);

            const error = new Error(err);
            error.httpStatuseCode = 500;
            return next(error);
        });
};

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDesc = req.body.description;
    const sale_enabled = req.body.sale_enabled === 'on' ? true : false;
    const sale_price = parseFloat(req.body.sale_price);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: false,
            isAuthenticated: req.session.isLoggedIn,
            hasError: true,
            product: {
                title: req.body.title,
                imageUrl: req.body.imageUrl,
                price: req.body.price,
                description: req.body.description,
                sale: { active: sale_enabled, saleAmount: sale_price },
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
        });
    }
    Product.findOne({ _id: prodId, userId: req.user._id })
        .then((product) => {
            product._id = prodId;
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.description = updatedDesc;
            product.imageUrl = updatedImageUrl;
            product.sale = { active: sale_enabled, saleAmount: sale_price };
            return product.save();
        })
        .then((result) => {
            console.log('UPDATED PRODUCT!');
            res.redirect('/admin/products');
        })
        .catch((err) => {
            console.log(err);
            const error = new Error(err);
            error.httpStatuseCode = 500;
            return next(error);
        });
};

exports.getProducts = (req, res, next) => {
    Product.find({ userId: req.user._id })
        .then((products) => {
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products',
                isAuthenticated: req.session.isLoggedIn,
            });
        })
        .catch((err) => {
            console.log(err);

            const error = new Error(err);
            error.httpStatuseCode = 500;
            return next(error);
        });
};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findOneAndRemove({ _id: prodId, userId: req.user._id })
        .then(() => {
            console.log('DESTROYED PRODUCT');
            res.redirect('/admin/products');
        })
        .catch((err) => {
            console.log(err);

            const error = new Error(err);
            error.httpStatuseCode = 500;
            return next(error);
        });
};

exports.postSale = (req, res, next) => {};
