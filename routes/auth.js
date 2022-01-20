const express = require('express');
const { check } = require('express-validator/check');
const User = require('../models/user');
const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);
router.get('/new-password/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

router.get('/signup', authController.getSignup);

router.post(
    '/login',
    check('email')
        .isEmail()
        .withMessage('Please enter a vaild email!')
        .custom((value, { req }) => {
            return User.findOne({ email: value }).then((userDoc) => {
                if (!userDoc) {
                    return Promise.reject('Login Failed.');
                }
            });
        })
        .normalizeEmail()
        .trim(),
    check('password')
        .isLength({ min: 6, max: 25 })
        .withMessage(
            'Passwords must be at lest 6 charaters long and no more than 25.'
        ),

    authController.postLogin
);

router.post(
    '/signup',
    check('email')
        .isEmail()
        .withMessage('Please enter a vaild email!')
        .custom((value, { req }) => {
            return User.findOne({ email: value }).then((userDoc) => {
                if (userDoc) {
                    return Promise.reject('Email already exists in the System');
                }
            });
        })
        .normalizeEmail()
        .trim(),
    check('password')
        .isLength({ min: 6, max: 25 })
        .withMessage(
            'Passwords must be at lest 6 charaters long and no more than 25.'
        ),
    check('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match!');
        }
        return true;
    }),
    authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);

module.exports = router;
