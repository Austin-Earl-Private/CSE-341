const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongo = require('./util/database');

const errorController = require('./controllers/error');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const User = require('./models/user');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById('61e06b0bfc49abcfbdb3842a')
        .then((user) => {
            req.user = new User(
                user.username,
                user.email,
                user._id.toString(),
                user.cart
            );
            next();
        })
        .catch((err) => {
            console.log(err);
            next();
        });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongo.mongoConnect(() => {
    // console.log(client);

    app.listen(3000);
});
