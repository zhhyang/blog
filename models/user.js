/**
 * Created by freeman on 16-3-27.
 */


var mongodb = require('./db'),
    crypto = require('crypto');

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

    mongodb.open(function (err,db) {
        if (err) {
            return callback(err);//错误，返回 err 信息
        };
        db.collection('users',function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);//错误，返回 err 信息
            }
            collection.insert(user,{safe:true},function (err,user) {
                mongodb.close();
                if (err) {
                    return callback(err);//错误，返回 err 信息
                }
                callback(null,user[0]);//成功！err 为 null，并返回存储后的用户文档
            });

        });

    });
};

User.get = function (name,callback) {
  mongodb.open(function (err,db) {
      if (err) {
          return callback(err);//错误，返回 err 信息
      };
      db.collection('users',function (err, collection) {
          if (err) {
              mongodb.close();
              return callback(err);//错误，返回 err 信息
          }
          collection.findOne({name:name},function (err,user) {
              mongodb.close();
              if (err) {
                  return callback(err);//错误，返回 err 信息
              }
              callback(null,user);//成功！err 为 null，并返回存储后的用户文档
          });

      });
      
  });
};