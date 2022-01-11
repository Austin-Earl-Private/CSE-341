const products = [];
const Product = require('../model/product');

function getAddProduct(req, res, next) {
    res.render('add-product', {
        docTitle: 'Add product',
        path: '/admin/add-product',
    });
}

function postAddProduct(req, res, next) {
    let book = req.body;
    // Adding a description can be hard at times..... so Im lazy and added a default.
    const product = new Product(book.title, book.price, book.description);
    product.save();
    res.redirect('/');
}

function getProducts(req, res, next) {
    Product.fetchAll((prods) => {
        res.render('shop', {
            prods: prods,
            docTitle: 'Shop',
            path: '/',
        });
    });
}

exports.getAddProduct = getAddProduct;
exports.postAddProduct = postAddProduct;
exports.getProducts = getProducts;
exports.products = products;
