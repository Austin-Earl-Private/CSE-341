const fs = require('fs');
const path = require('path');
const root = require('../util/path');
const p = path.join(root, 'data', 'products.json');

const getProductsFromFile = (cb) => {
    fs.readFile(p, (err, fileContent) => {
        if (err) {
            cb([]);
            return;
        }
        cb(JSON.parse(fileContent));
    });
};
module.exports = class Product {
    constructor(
        title = 'An Interesting Book',
        price = 19.99,
        description = 'A very interesting book about so many even more interesting things!'
    ) {
        this.title = title ? title : 'An Interesting Book';
        this.price = price ? price : 19.99;
        this.description = description
            ? description
            : 'A very interesting book about so many even more interesting things!';
    }

    save() {
        getProductsFromFile((products) => {
            products.push(this);
            fs.writeFile(p, JSON.stringify(products), (err) => {
                if (err) {
                    console.log(err);
                }
            });
        });
    }

    static fetchAll(cb) {
        getProductsFromFile(cb);
    }
};
