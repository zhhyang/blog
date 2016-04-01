/**
 * Created by Freeman on 2016/4/1.
 */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/blog');
exports.mongoose = mongoose;