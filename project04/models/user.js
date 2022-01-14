const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    cart: {
        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                quantity: { type: Number, required: true },
            },
        ],
    },
});

userSchema.methods.clearCart = function () {
    this.cart.items = [];
    return this.save();
};

userSchema.methods.addToCart = function (product) {
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
    this.cart = updatedCart;
    return this.save();
};

userSchema.methods.getCart = function () {
    return this.cart.items;
};

userSchema.methods.deleteItemFromCart = function (productId) {
    const updatedCartItems = this.cart.items.filter((i) => {
        return i.productId.toString() !== productId.toString();
    });
    this.cart.items = updatedCartItems;
    return this.save();
};

// addOrder() {
//         const db = getDb();
//         return this.getCart()
//             .then((products) => {
//                 const order = {
//                     items: products,
//                     userId: {
//                         _id: this._id,
//                         name: this.name,
//                         email: this.email,
//                     },
//                 };
//                 return db.collection('orders').insertOne(order);
//             })
//             .then((result) => {
//                 this.cart = { items: [] };
//                 db.collection('users').updateOne(
//                     { _id: this._id },
//                     { $set: { cart: { items: [] } } }
//                 );
//             });
//     }

//     getOrders() {
//         const db = getDb();
//         return db
//             .collection('orders')
//             .find({ 'userId._id': this._id })
//             .toArray()
//             .then((orders) => {
//                 return orders;
//             });
//     }

module.exports = mongoose.model('User', userSchema);
