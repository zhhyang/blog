/**
 * Created by freeman on 16-3-27.
 */


var mongodb = require('./db');

function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
}

module.exports = User;

User.prototype.save = function (callback) {
    var user = {
        name : this.name,
        password :this.password,
        email : this.email
    };

    mongodb.open(function (err,db) {
        if (err) {
            return callback(err);//错误，返回 err 信息
        };
        db.collection('users',function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);//错误，返回 err 信息
            }
            collection.insert('users',{safe:true},function (err,user) {
                mongodb.close();
                if (err) {
                    return callback(err);//错误，返回 err 信息
                }
                callback(null,user[0]);//成功！err 为 null，并返回存储后的用户文档
            });

        });

    });
};