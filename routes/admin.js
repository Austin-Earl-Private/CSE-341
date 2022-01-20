const path = require('path');
const { check } = require('express-validator/check');

const express = require('express');

const adminController = require('../controllers/admin');

const router = express.Router();
const isAuth = require('../middleware/is-auth');

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post(
    '/add-product',
    isAuth,
    check(
        'title',
        'Title has to be at least 3 charaters long and only contain Alphanumeric charaters.'
    )
        .isString()
        .isLength({ min: 3 })
        .trim(),
    check('imageUrl', 'Image URL must be a vaild URL.').isURL().trim(),
    check('price', 'Price must be a number with decimal').isFloat(),
    check('description', 'description must be at least 5 charaters.')
        .isLength({ min: 5 })
        .trim(),
    adminController.postAddProduct
);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post(
    '/edit-product',
    check(
        'title',
        'Title has to be at least 3 charaters long and only contain Alphanumeric charaters.'
    )
        .isAlphanumeric()
        .isLength({ min: 3 })
        .trim(),
    check('imageUrl', 'Image URL must be a vaild URL.').isURL().trim(),
    check('price', 'Price must be a number with decimal').isFloat(),
    check('description', 'description must be at least 5 charaters.')
        .isLength({ min: 5 })
        .trim(),
    isAuth,
    adminController.postEditProduct
);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
