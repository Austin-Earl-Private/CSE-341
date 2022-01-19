const User = require('../models/user');
const bcrypt = require('bcryptjs');
// const nodemailer = require('nodemailer');
// const sendgridTransport = require('nodemailer-sendgrid-transport');
const sendgrid = require('@sendgrid/mail');
// const transporter = nodemailer.createTransport(
//     sendgridTransport({
//         auth: {
//             api_key:
//                 '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',
//         },
//     })
// );

sendgrid.setApiKey(
    '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'
);

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
                        email: email,
                        password: hash,
                        cart: { items: [] },
                    });
                    return user.save();
                })
                .then((result) => {
                    sendgrid.send(
                        {
                            to: email,
                            from: 'that1nerd@byui.edu',
                            subject: 'Welcome to Node-Shop!',
                            html: '<h1>Welcome to Node-Shop!</h1>',
                        },
                        (err, info) => {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log(info);
                            }
                        }
                    );
                    return res.redirect('/login');
                })
                .then(() => {
                    return;
                })
                .catch((err) => {
                    console.log(err);
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
