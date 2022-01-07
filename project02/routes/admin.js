const { Router } = require('express');
const express = require('express');
const path = require('path');
const rootDir = require('../util/path');

const products = [];
const router = express.Router();
router.get('/add-product', (req, res, next) => {
    // res.send(
    //     '<form action="/admin/add-product" method="POST" ><input type="text" name="title" ><button type="submit">Add Product</button></form>'
    // );
    // res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
    res.render('add-product', {
        docTitle: 'Add product',
        path: '/admin/add-product',
    });
});

router.post('/add-product', (req, res, next) => {
    console.log(req.body.title);
    products.push(req.body);
    res.redirect('/');
});

exports.routes = router;
exports.products = products;
