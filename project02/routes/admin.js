const { Router } = require('express');
const express = require('express');
const path = require('path');
const rootDir = require('../util/path');

const products = [];
const router = express.Router();
router.get('/add-product', (req, res, next) => {
    res.render('add-product', {
        docTitle: 'Add product',
        path: '/admin/add-product',
    });
});

router.post('/add-product', (req, res, next) => {
    let book = req.body;
    // Adding a description can be hard at times..... so Im lazy and added a default.
    if (book.description === '') {
        book.description =
            'A very interesting book about so many even more interesting things!';
    }
    console.log(book);

    products.push(req.body);
    res.redirect('/');
});

exports.routes = router;
exports.products = products;
