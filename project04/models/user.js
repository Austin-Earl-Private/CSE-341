const getDb = require('../util/database').getDb;
const mongodb = require('mongodb');
class User {
    constructor(username, email, id, cart) {
        this.name = username;
        this.email = email;
        this.cart = cart;
        if (id) {
            this._id = mongodb.ObjectId(id);
        }
    }

    save() {
        return getDb()
            .collection('users')
            .insertOne(this)
            .then((result) => {
                console.log(result);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    addToCart(product) {
        const cartProduct = this.cart.items.findIndex((item) => {
            console.log(item.productId, product._id);
            console.log(item.productId.toString() === product._id.toString());
            return item.productId.toString() === product._id.toString();
        });

        let newQuantity = 1;
        const updatedCartItems = [...this.cart.items];
        if (cartProduct >= 0) {
            newQuantity = this.cart.items[cartProduct].quantity + 1;
            updatedCartItems[cartProduct] = {
                quantity: newQuantity,
                productId: product._id,
            };
        } else {
            updatedCartItems.push({
                quantity: 1,
                productId: product._id,
            });
        }

        const updatedCart = {
            items: updatedCartItems,
        };
        const db = getDb();
        return db
            .collection('users')
            .updateOne({ _id: this._id }, { $set: { cart: updatedCart } });
    }
    getCart() {
        const db = getDb();
        const productIds = this.cart.items.map((item) => item.productId);
        return db
            .collection('products')
            .find({ _id: { $in: productIds } })
            .toArray()
            .then((products) => {
                return products.map((p) => {
                    return {
                        ...p,
                        quantity: this.cart.items.find((item) => {
                            return (
                                item.productId.toString() === p._id.toString()
                            );
                        }).quantity,
                    };
                });
            });
    }

    addOrder() {
        const db = getDb();
        return this.getCart()
            .then((products) => {
                const order = {
                    items: products,
                    userId: {
                        _id: this._id,
                        name: this.name,
                        email: this.email,
                    },
                };
                return db.collection('orders').insertOne(order);
            })
            .then((result) => {
                this.cart = { items: [] };
                db.collection('users').updateOne(
                    { _id: this._id },
                    { $set: { cart: { items: [] } } }
                );
            });
    }

    getOrders() {
        const db = getDb();
        return db
            .collection('orders')
            .find({ 'userId._id': this._id })
            .toArray()
            .then((orders) => {
                return orders;
            });
    }

    deleteItemFromCart(productId) {
        const updatedCartItems = this.cart.items.filter(
            (i) => i.productId.toString() !== productId
        );
        const db = getDb();
        return db
            .collection('users')
            .updateOne(
                { _id: this._id },
                { $set: { cart: { items: updatedCartItems } } }
            );
    }

    static findById(userId) {
        return getDb()
            .collection('users')
            .findOne({ _id: new mongodb.ObjectId(userId) })
            .then((result) => {
                console.log(result);
                return result;
            })
            .catch((err) => {
                console.log(err);
            });
    }
}

module.exports = User;
