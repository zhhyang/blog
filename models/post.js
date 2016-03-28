/**
 * Created by freeman on 16-3-27.
 */


var mongodb = require('./db'),
    markdown = require('markdown').markdown;

function Post(name, title, post) {
    this.name = name;
    this.title = title;
    this.post = post;
}

module.exports = Post;

Post.prototype.save = function (callback) {
    var date = new Date();

    //存储各种时间格式，方便以后扩展
    var time = {
        date: date,
        year : date.getFullYear(),
        month : date.getFullYear() + "-" + (date.getMonth() + 1),
        day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
        date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    };

    var post = {
        name : this.name,
        title :this.title,
        post : this.post,
        time:time
    };

    mongodb.open(function (err,db) {
        if (err) {
            return callback(err);//错误，返回 err 信息
        };
        db.collection('posts',function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);//错误，返回 err 信息
            }
            collection.insert(post,{safe:true},function (err,post) {
                mongodb.close();
                if (err) {
                    return callback(err);//错误，返回 err 信息
                }
                callback(null,post[0]);//成功！err 为 null，并返回存储后的用户文档
            });

        });

    });
};

Post.get = function (name,callback) {
  mongodb.open(function (err,db) {
      if (err) {
          return callback(err);//错误，返回 err 信息
      };
      db.collection('posts',function (err, collection) {
          if (err) {
              mongodb.close();
              return callback(err);//错误，返回 err 信息
          }
          var query = {};
          if (name){
            query.name = name;
          }

          collection.find(query).sort({time:-1}).toArray(function (err,docs) {
              mongodb.close();
              if (err){
                  return callback(err);//失败！返回 err
              }
              docs.forEach(function (doc) {
                 doc.post = markdown.toHTML(doc.post);
              });
              callback(null,docs);
          })

      });
      
  });
};