const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');

const app = express();

const cors = require('cors');
const corsOptions = {
    origin: 'https://personal-app-cse341.herokuapp.com/',
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const User = require('./models/user');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById('61e0b5838e0d4d67e9af8e4e')
        .then((user) => {
            req.user = user;
            next();
        })
        .catch((err) => {
            console.log(err);
            next();
        });
    // next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
    .connect(
        'mongodb+srv://database:vbfgrt45%24%25@cluster0.lj6vk.mongodb.net/shop?w=majority'
    )
    .then(() => {
        User.findOne().then((user) => {
            if (!user) {
                const user = new User({
                    name: 'Austin Earl',
                    email: 'theqmind2020@gmail.com',
                    cart: { items: [] },
                });
                user.save();
            }
        });

        app.listen(process.env.PORT || 3000);
    })
    .catch((err) => {
        console.log(err);
    });
