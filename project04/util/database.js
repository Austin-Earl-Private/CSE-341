const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const fs = require('fs');
const path = require('path');
const root = require('../util/path');

let _db;

const mongoConnect = (cb) => {
    // I KNOW I KNOW.... Secrets are not to be saved in code!
    // So I have it in a file called database.txt not pushed to github
    const uri = fs
        .readFileSync(path.join(root, 'data', 'database.txt'))
        .toString();
    MongoClient.connect(uri)
        .then((result) => {
            console.log('Connected to mongodb');
            _db = result.db();
            cb(result);
        })
        .catch((err) => {
            console.log(err);
            throw err;
        });
};

const getDb = () => {
    if (_db) {
        return _db;
    }
    throw 'Now Database Found';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
