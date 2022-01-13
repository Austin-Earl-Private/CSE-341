const getDb = require('../util/database').getDb;
const mongodb = require('mongodb');

class Product {
    constructor(title, price, description, imageUrl, id, userId) {
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        if (id) {
            this._id = new mongodb.ObjectId(id);
        }
        if (userId) {
            this.userId = new mongodb.ObjectId(userId);
        }
    }

    save() {
        const db = getDb();
        let dbOp;
        if (this._id) {
            dbOp = db
                .collection('products')
                .updateOne({ _id: this._id }, { $set: this });
        } else {
            dbOp = db.collection('products').insertOne(this);
        }
        console.log('UPDATE/SAVE: ' + this);
        return dbOp
            .then((result) => {
                console.log(result);
            })
            .catch((err) => {
                console.log(err);
            });
    }
    static fetchAll() {
        return getDb()
            .collection('products')
            .find({})
            .toArray()
            .then((products) => {
                console.log(products);
                return products;
            })
            .catch((err) => {
                console.log(err);
            });
    }

    static findById(prodId) {
        console.log('prodId is: ' + prodId);

        return getDb()
            .collection('products')
            .find({ _id: prodId })
            .next()
            .then((product) => {
                console.log(product);
                return product;
            })
            .catch((err) => {
                console.log(err);
            });
    }

    static deleteById(prodId) {
        return getDb()
            .collection('products')
            .deleteOne({ _id: new mongodb.ObjectId(prodId) })
            .then((product) => {
                // console.log(product);
                // return product;
            })
            .catch((err) => {
                console.log(err);
            });
    }
}
module.exports = Product;

// const Product = sequelize.define('product', {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true,
//     },
//     title: Sequelize.STRING,
//     price: {
//         type: Sequelize.DOUBLE,
//         allowNull: false,
//     },
//     imageUrl: {
//         type: Sequelize.STRING,
//         allowNull: false,
//     },
//     description: {
//         type: Sequelize.STRING,
//         allowNull: false,
//     },
// });
