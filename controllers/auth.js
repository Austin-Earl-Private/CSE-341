const User = require('../models/user');
const bcrypt = require('bcryptjs');
exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: req.flash('error'),
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const pass = req.body.password;
    User.findOne({ email: email })
        .then((user) => {
            if (!user) {
                req.flash('error', 'Email or password is incorect!');
                return res.redirect('/login');
            }
            bcrypt
                .compare(pass, user.password)
                .then((doMatch) => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save((err) => {
                            console.log(err);
                            res.redirect('/');
                        });
                    }
                    req.flash('error', 'Email or password is incorect!');
                    return res.redirect('/login');
                })
                .catch((err) => {
                    console.log(err);
                    res.redirect('/login');
                });
        })
        .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    });
};
exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    if (password !== confirmPassword) {
        req.flash('error', 'Passwords do not match!');
        return res.redirect('/signup');
    }
    User.findOne({ email: email })
        .then((userDoc) => {
            if (userDoc) {
                console.log('duplicated found');
                req.flash('error', 'Email already exists in the System');
                return res.redirect('/signup');
            }
            return bcrypt
                .hash(password, 12)
                .then((hash) => {
                    const user = new User({
                        name: 'test',
                        email: email,
                        password: hash,
                        cart: { items: [] },
                    });
                    return user.save();
                })
                .then((result) => {
                    res.redirect('/login');
                });
        })
        .catch((err) => {});
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        isAuthenticated: false,
        errorMessage: req.flash('error'),
    });
};
