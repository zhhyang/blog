/**
 * Created by freeman on 16-3-27.
 */


var mongodb = require('./db'),
    markdown = require('markdown').markdown,
    ObjectID = require('mongodb').ObjectID,
    mongoosedb = require('./mongoosedb');

var Schema = mongoosedb.mongoose.Schema;

var postSchema = new Schema({
    name: String,
    head: String,
    title: String,
    tags: { type: []},
    post: String,
    time: {
        date: Date,
        year: Number,
        month: String,
        day: String,
        minute: String
    },
    comments: [{
        name: String,
        email: String,
        website: String,
        time: String,
        content: String
    }],
    pv: {type: Number, default: 0}
},{
    collection: 'posts'
});

var postModel = mongoosedb.mongoose.model('Post',postSchema);


function Post(name, head,title, tags ,post) {
    this.name = name;
    this.head = head;
    this.title = title;
    this.tags = tags;
    this.post = post;
}

module.exports = Post;

Post.prototype.save = function (callback) {
    var date = new Date();

    //存储各种时间格式，方便以后扩展
    var time = {
        date: date,
        year: date.getFullYear(),
        month: date.getFullYear() + "-" + (date.getMonth() + 1),
        day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
        date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    };

    var post = {
        name: this.name,
        head: this.head,
        title: this.title,
        tags : this.tags,
        post: this.post,
        time: time,
        comments: [],
        pv: 0
    };


    var newPost = new postModel(post);

    newPost.save(function (err,post) {
        if(err){
            return callback(err);
        }
        callback(null,post);
    });
};


/*postSchema.methods = {
    addComment: function (id, comment, callback) {

        this.comments.push(comment);
        return this.save();
    }
};*/
/**
 * add comment
 *
 * */
Post.addComment = function (id,comment,callback) {

    mongodb.open(function (err, db) {
        if (err) {
            mongodb.close();
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.update({
                "_id": ObjectID(id),
            }, {
                $push: {"comments": comment}
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        })
    })
};



Post.getAllByPage = function (name,page,size, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);//错误，返回 err 信息
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);//错误，返回 err 信息
            }
            var query = {};
            if (name) {
                query.name = name;
            }
            collection.count(query,function (err,total) {
                collection.find(query,{
                    skip: (page - 1)*size,
                    limit: size
                }).sort({time: -1}).toArray(function (err, docs) {
                    mongodb.close();
                    if (err) {
                        return callback(err);//失败！返回 err
                    }
                    docs.forEach(function (doc) {
                        doc.post = markdown.toHTML(doc.post);
                    });
                    callback(null, docs,total);
                })
            });




        });

    });
};

Post.getOneById = function (_id, callback) {

    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);//错误，返回 err 信息
            }
            collection.findOne({
                "_id" : ObjectID(_id)
            }, function (err, doc) {
                if (err) {
                    return callback(err);
                }
                if(doc){
                    collection.update({
                        "_id" : ObjectID(_id)
                    },{$inc:{"pv":1}},function (err) {
                        mongodb.close();
                        if (err) {
                            return callback(err);
                        }
                    });
                    doc.post = markdown.toHTML(doc.post);
                    doc.comments.forEach(function (comment) {
                        comment.content = markdown.toHTML(comment.content);
                    });
                    callback(null, doc);
                }

            });
        })

    })

};

Post.getOne = function (name, day, title, callback) {

    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);//错误，返回 err 信息
            }
            collection.findOne({
                "name": name,
                "time.day": day,
                "title": title
            }, function (err, doc) {
                if (err) {
                    return callback(err);
                }
                if(doc){
                    collection.update({
                        "name": name,
                        "time.day": day,
                        "title": title
                    },{$inc:{"pv":1}},function (err) {
                        mongodb.close();
                        if (err) {
                            return callback(err);
                        }
                    });
                    doc.post = markdown.toHTML(doc.post);
                    doc.comments.forEach(function (comment) {
                        comment.content = markdown.toHTML(comment.content);
                    });
                    callback(null, doc);
                }

            });
        })

    })

};

Post.edit = function (_id, callback) {

    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);//错误，返回 err 信息
            }
            collection.findOne({
                "_id": ObjectID(_id)
            }, function (err, doc) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, doc);//非markdown格式
            });
        })

    })

};

Post.update = function (_id, post, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.update({
                "_id": ObjectID(_id)
            }, {
                $set: {post: post}
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });


        })

    })
};

Post.remove = function (_id, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.remove({
                "_id": ObjectID(_id)
            }, {
                w: 1
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            })

        })
    })
};

Post.getArchive = function (callback) {

    mongodb.open(function (err,db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts',function (err,collection) {

            if (err){
                mongodb.close();
                return callback(err);
            }
            collection.find({},{
                "name":1,
                "title":1,
                "time":1
            }).sort({
                time:-1
            }).toArray(function (err,docs) {
                mongodb.close();
                if (err){
                    return callback(err);
                }
                callback(err,docs);
            });

        })

    })
};

Post.getTags = function (callback) {
  mongodb.open(function (err,db) {

      if(err){
          return callback(err);
      }
      db.collection('posts',function (err,collection) {
            if (err){
                mongodb.close();
                return callback(err);
            }
          collection.distinct('tags',function (err,docs) {
              mongodb.close();
              if (err){
                  return callback(err);
              }
              callback(null,docs);
              
          })
      })
  })
};

Post.getPostsByTag = function (tag,callback) {
     mongodb.open(function (err,db) {
         if (err){
             return callback(err);
         }
         db.collection('posts',function (err,collection) {
             if (err) {
                 mongodb.close();
                 return callback(err);
             }
             collection.find({
                 "tags":tag
             },{
                 "name": 1,
                 "time": 1,
                 "title": 1
             }).sort({time:-1}).toArray(function (err,docs) {
                 mongodb.close();
                 if (err) {
                     return callback(err);
                 }
                 callback(null, docs);

             })

         })
     })
};

Post.search = function (keyword,callback) {
    mongodb.open(function (err,db) {
        if (err){
            return callback(err);
        }
        db.collection('posts',function (err,collection) {

            if (err){
                mongodb.close();
                return callback(err);
            }
            //使用正则，忽略大小写
            var pattern = new RegExp(keyword,"i");
            console.log("正则为:"+pattern);
            collection.find({
                "title":pattern
            },{
                "name": 1,
                "time": 1,
                "title": 1
            }).toArray(function (err,docs) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, docs);
            });

        })

    })


};