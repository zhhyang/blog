/**
 * Created by freeman on 16-3-27.
 */


var mongodb = require('./db'),
    crypto = require('crypto'),
    async = require('async');

function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
}

module.exports = User;

User.prototype.save = function (callback) {
    var md5 = crypto.createHash('md5'),
        email_MD5 = md5.update(this.email.toLowerCase()).digest('hex'),
        head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=48";
    var user = {
        name : this.name,
        password :this.password,
        email : this.email,
        head:head
    };

    async.waterfall([
        function (cb) {
            mongodb.open(function (err,db) {
                cb(err,db);
            });
        },
        function (db,cb) {
            db.collection('users',function (err,collection) {
                cb(err,collection);
            });
        },
        function (collection,cb) {
            collection.insert(user,{safe:true},function (err,user) {
                cb(err,user);
            });
        }
    ],function (err,user) {
        mongodb.close();
        callback(null,user[0]);//成功！err 为 null，并返回存储后的用户文档
    });
};

User.get = function (name,callback) {
    async.waterfall([
        function (cb) {
            mongodb.open(function (err,db) {
                cb(err,db);

            });
        },
        function (db,cb) {
            db.collection('users',function (err,collection) {
                cb(err,collection);
            });
        },
        function (collection,cb) {
            collection.findOne({name:name},function (err,user) {
                cb(err,user);
            })
        }
    ],function (err,user) {
        mongodb.close();
        callback(err,user);
    });
};