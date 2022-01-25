const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { validationResult } = require('express-validator/check');

const emailOptions = {
    host: process.env.EMAIL_SMTP_URL,
    port: parseInt(process.env.EMAIL_SMTP_PORT_SSL),
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_SMTP_PASSWORD,
    },
};
const transporter = nodemailer.createTransport(emailOptions);

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: req.flash('error'),
        oldInput: { email: '', password: '' },
        validationErrors: [],
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const pass = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            isAuthenticated: false,
            errorMessage: errors.array()[0].msg,
            oldInput: { email: email, password: pass },
            validationErrors: [],
        });
    }

    User.findOne({ email: email })
        .then((user) => {
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
                    } else {
                        return res.status(422).render('auth/login', {
                            path: '/login',
                            pageTitle: 'Login',
                            isAuthenticated: false,
                            errorMessage: 'Login Failed.',
                            oldInput: { email: email, password: pass },
                            validationErrors: [],
                        });
                    }
                })
                .catch((err) => {
                    const error = new Error(err);
                    error.httpStatuseCode = 500;
                    return next(error);
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

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            isAuthenticated: false,
            errorMessage: errors.array()[0].msg,
            oldInput: { email: email, password: password },

            validationErrors: errors.array(),
        });
    }

    User.findOne({ email: email })
        .then((userDoc) => {
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
                    transporter
                        .sendMail({
                            to: email,
                            from: 'theqmind2020@gmail.com',
                            subject: 'Welcome to Node-Shop!',
                            html: '<h1>Welcome to Node-Shop!</h1>',
                        })
                        .then((info) => {
                            console.log('Sent to: %s', info.messageId);
                        });
                    return res.redirect('/login');
                })
                .catch((err) => {
                    const error = new Error(err);
                    error.httpStatuseCode = 500;
                    return next(error);
                });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatuseCode = 500;
            return next(error);
        });
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        isAuthenticated: false,
        errorMessage: req.flash('error'),
        oldInput: { email: '', password: '' },
        validationErrors: validationResult(req).array(),
    });
};

exports.getReset = (req, res, next) => {
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: req.flash('error'),
    });
};

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buff) => {
        if (err) {
            console.log(err);
            return res.redirect('/reset');
        }
        const token = buff.toString('hex');
        User.findOne({ email: req.body.email })
            .then((user) => {
                if (!user) {
                    req.flash('error', 'No account found for that email.');
                    return req.redirect('/reset');
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            })
            .then((result) => {
                transporter
                    .sendMail({
                        to: req.body.email,
                        from: 'node-shop@gmail.com',
                        subject: 'Password Reset',
                        html: `
                         <p>You requested a password reset!</p>
                         <p>Click this <a href="http://${process.env.APP_DOMAIN}/new-password/${token}">link</a> to set a new password</p>
                         `,
                    })
                    .then((info) => {
                        console.log('Sent to: %s', info.messageId);
                    });
                req.flash(
                    'error',
                    'An email hs been sent to your email address containing a link to reset your password.'
                );
                return res.redirect('/login');
            })
            .catch((err) => {
                console.log(err);

                const error = new Error(err);
                error.httpStatuseCode = 500;
                return next(error);
            });
    });
};

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({
        resetToken: token,
        resetTokenExpiration: {
            $gt: Date.now(),
        },
    })
        .then((user) => {
            if (!user) {
                res.flash('Error Token expired');
                return res.redirect('/login');
            }
            return res.render('auth/new-password', {
                path: '/new-password',
                pageTitle: 'New Password',
                errorMessage: req.flash('error'),
                userId: user._id.toString(),
                passwordToken: token,
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatuseCode = 500;
            return next(error);
        });
};

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    console.log('reseting password');
    User.findOne({
        resetToken: passwordToken,
        resetTokenExpiration: { $gt: Date.now() },
        _id: userId,
    })
        .then((user) => {
            if (!user) {
                req.flash(
                    'Cant not reset password. Try again or contact support.'
                );
                return res.redirect('/login');
            }

            user.resetToken = undefined;
            user.resetTokenExpiration = undefined;
            return bcrypt.hash(newPassword, 12).then((result) => {
                user.password = result;
                return user.save();
            });
        })
        .then((result) => {
            res.redirect('/login');
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatuseCode = 500;
            return next(error);
        });
};
