var crypto = require('crypto'),
    User = require('../models/user'),
    Post = require('../models/post');


module.exports = function (app) {
    /**
     * 首页跳转
     *
     * */
    app.get('/', function (req, res) {
        Post.getAll(null,function (err,posts) {
            if (err){
                posts = [];
            }
            res.render('index', {
                title: '主页',
                user: req.session.user,
                posts: posts,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });
    /**
     * 注册跳转
     *
     * */
    app.get('/reg',function (req,res) {
        res.render('reg',{title: '注册'});
    });
    /**
     * 注册
     *
     * */
    app.post('/reg', function (req, res) {
        var name = req.body.name,
            password = req.body.password,
            password_re = req.body['password-repeat'],
            email = req.body.email;

        //检验用户两次输入的密码是否一致
        if (password_re != password) {
            console.log('两次输入的密码不一致!');
            req.flash('error', '两次输入的密码不一致!');
            return res.redirect('/reg');//返回注册页
        }
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        var newUser = new User({
            name : name,
            password :password,
            email : email
        });
        User.get(newUser.name,function (err,user) {
           if (err){
               console.log(err);
               req.flash('error',err);
               return res.redirect('/')
           }
            if (user){
                console.log(user);
                req.flash('error', '用户已存在!');
                return res.redirect('/reg');//返回注册页
            }
            newUser.save(function (err,user) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/reg');//注册失败返回主册页
                }
                req.session.user = user;//用户信息存入 session
                req.flash('success', '注册成功!');
                res.redirect('/');//注册成功后返回主页
            })
        });

    });
    /**
     * 登录跳转
     *
     * */
    app.get('/login', function (req, res) {
        res.render('login', {
            title: '登录',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
    /**
     * 登录
     *
     * */
    app.post('/login', function (req, res) {
        var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
        User.get(req.body.name,function (err,user) {
            if(!user){
                req.flash('error', '用户不存在!');
                return res.redirect('/login');//用户不存在则跳转到登录页
            }
            if(user.password != password){
                req.flash('error', '密码错误!');
                return res.redirect('/login');//用户密码错误则跳转到登录页
            }
            req.session.user = user;
            req.flash('success', '登陆成功!');
            res.redirect('/');//登陆成功后跳转到主页
        })



    });
    /**
     * 文章发布跳转
     *
     * */
    app.get('/post', function (req, res) {
        res.render('post', {
            title: '发表',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
    /**
     * 文章发布
     *
     * */
    app.post('/post', function (req, res) {
        var currentUser = req.session.user,
            post = new Post(currentUser.name,req.body.title,req.body.post);

        post.save(function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            req.flash('success', '发布成功!');
            res.redirect('/');//发表成功跳转到主页
        })

    });
    app.get('/logout', function (req, res) {
        req.session.user = null;
        req.flash('success', '登出成功!');
        res.redirect('/');//登出成功后跳转到主页
    });


    app.get('/upload',function (req,res) {
        res.render('upload', {
            title: '文件上传',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });

    app.post('/upload', function (req, res) {
        req.flash('success', '文件上传成功!');
        res.redirect('/upload');
    });

    /**
     *
     * */
    app.get('/u/:name',function (req,res) {
        User.get(req.params.name,function (err,user) {
            if (!user){
                req.flash('error', '用户不存在!');
                return res.redirect('/');//用户不存在则跳转到主页
            }
            Post.getAll(user.name,function (err,posts) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/');
                }
                res.render('user',{
                    title: user.name,
                    posts: posts,
                    user : req.session.user,
                    success : req.flash('success').toString(),
                    error : req.flash('error').toString()
                })
            })
        })
    });

    app.get('/u/:name/:day/:title',function (req,res) {
        Post.getOne(req.params.name,req.params.day,req.params.title,function (err,post) {
            if (!post){
                req.flash('error', err);
                return res.redirect('/');//用户不存在则跳转到主页
            }
            res.render('article',{
                title: req.params.title,
                post: post,
                user : req.session.user,
                success : req.flash('success').toString(),
                error : req.flash('error').toString()
            })
        })
    });

    app.use(function (req, res) {
        res.render("404");
    });
};
