var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');

var settings = require('./settings');
var flash = require('connect-flash');
var session = require('express-session');
//
var MongoStore = require('connect-mongo')(session);
//用redis来存储session
var RedisStore = require('connect-redis')(session);
var multer = require('multer');

var exphbs  = require('express-handlebars');

var passport = require('passport');
var GithubStrategy = require('passport-github').Strategy;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.engine('hbs', exphbs({
  layoutsDir: 'views',
  partialsDir: 'views/partials',
  defaultLayout: 'layout',
  extname: '.hbs'
}));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/*app.use(session({
  secret: settings.cookieSecret,
  key: settings.db,//cookie name
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
  store: new MongoStore({
    db: settings.db,
    host: settings.host,
    port: settings.port
  })
}));*/
var store = new MongoStore({
    url: 'mongodb://localhost:27017/blog',
    collection: 'sessions'
});
app.use(session({
    secret: settings.cookieSecret,
    store: store,
    resave: true,
    saveUninitialized: true
}));

app.use(flash());

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now()+'.jpg')
    }
});

var upload = multer({ storage: storage });

app.use(passport.initialize());//初始化 Passport

routes(app,upload);
// error handlers

passport.use(new GithubStrategy({
    clientID: "ff75066b71b712f03740",
    clientSecret: "f0efe7f850a936c8d52198bb78c6cddf16ba81ac",
    callbackURL: "http://localhost:3000/login/github/callback"
}, function(accessToken, refreshToken, profile, done) {
    done(null, profile);
}));

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
        layout: false
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
      layout: false,
    error: {}
  });
});


module.exports = app;
