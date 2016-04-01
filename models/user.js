/**
 * Created by freeman on 16-3-27.
 */


var mongoosedb = require('./mongoosedb'),
    crypto = require('crypto');

var Schema = mongoosedb.mongoose.Schema;

var userSchema = new Schema({
    name: String,
    password: String,
    email: String,
    head: String
},{
    collection: 'users'
});
var userModel = mongoosedb.mongoose.model('User',userSchema);

function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
}


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

    var newUser = new userModel(user);

    newUser.save(function (err,user) {
        if(err){
            return callback(err);
        }
        callback(null,user);
    })
};

User.get = function (name,callback) {
    userModel.findOne({name:name},function (err,user) {
        if (err) {
            return callback(err);
        }
        callback(null, user);
    })
};


module.exports = User;