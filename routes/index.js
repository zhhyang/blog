var crypto = require('crypto'),
    User = require('../models/user'),
    Post = require('../models/post'),
    Comment = require('../models/comment');


module.exports = function (app) {
    /**
     * 首页跳转
     *
     * */
    app.get('/', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1,
            size =10;
        Post.getAllByPage(null,page,size,function (err,posts,total) {
            if (err){
                posts = [];
            }
            res.render('index', {
                title: '主页',
                user: req.session.user,
                posts: posts,
                page:page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 10 + posts.length) == total,
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
            tags = [req.body.tag1, req.body.tag2, req.body.tag3],
            post = new Post(currentUser.name,currentUser.head,req.body.title,tags,req.body.post);

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
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1,
            size =10;
        User.get(req.params.name,function (err,user) {
            if (!user){
                req.flash('error', '用户不存在!');
                return res.redirect('/');//用户不存在则跳转到主页
            }

            Post.getAllByPage(user.name,page,size,function (err,posts,total) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/');
                }
                res.render('user',{
                    title: user.name,
                    posts: posts,
                    page:page,
                    isFirstPage: (page - 1) == 0,
                    isLastPage: ((page - 1) * 10 + posts.length) == total,
                    user : req.session.user,
                    success : req.flash('success').toString(),
                    error : req.flash('error').toString()
                })
            })
        })
    });
    /**
     * 打开一篇文章
     * @bug
     * */
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
    /**
     * 按id查询
     * */
    app.get('/p/:_id',function (req,res) {
        Post.getOneById(req.params._id,function (err,post) {
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


    /**
     * 提交留言
     * */
    app.post('/u/:name/:day/:title',function (req,res) {
        var date = new Date(),
            time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
                date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
        var comment = {
            name: req.body.name,
            email: req.body.email,
            website: req.body.website,
            time: time,
            content: req.body.content
        };
        var newComment = new Comment(req.params.name, req.params.day, req.params.title, comment);
        newComment.save(function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            req.flash('success', '留言成功!');
            res.redirect('back');
        })
    });

    /**
     * 跳转到修改页面
     * */
    app.get('/edit/:name/:day/:title',function (req,res) {
        Post.edit(req.params.name,req.params.day,req.params.title,function (err,post) {
            if (!post){
                req.flash('error', err);
                return res.redirect('/');//用户不存在则跳转到主页
            }
            res.render('edit',{
                title: '编辑',
                post: post,
                user : req.session.user,
                success : req.flash('success').toString(),
                error : req.flash('error').toString()
            })
        })
    });
    /**
     * 执行修改动作
     * */
    app.post('/edit/:name/:day/:title',function (req,res) {
        console.log(req.params.name);
        console.log(req.params.day);
        console.log(req.params.title);
        console.log(req.body.post);
        Post.update(req.params.name,req.params.day,req.params.title,req.body.post,function (err) {
            var url = encodeURI('/u/' + req.params.name + '/' + req.params.day + '/' + req.params.title);
            if (err) {
                req.flash('error', err);
                return res.redirect(url);//出错！返回文章页
            }
            req.flash('success', '修改成功!');
            res.redirect(url);//成功！返回文章页
        })
    });
    /**
     *删除动作
     * */
    app.get('/remove/:name/:day/:title',function (req,res) {
        Post.remove(req.params.name,req.params.day,req.params.title,function (err) {
            if (err){
                req.flash('error', err);
                return res.redirect('back');
            }
            req.flash('success', '删除成功!');
            res.redirect('/');//删除成功!
        })
    });

    /**
     * Archive
     * */
    app.get('/archive',function (req,res) {

        Post.getArchive(function (err,posts) {
            if (err){
                req.flash('error', err);
                return res.redirect('/');
            }

            res.render('archive',{
                title: '存档',
                posts: posts,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        })
    });
    /**
     * tags
     * */
    app.get('/tags',function (req,res) {
        Post.getTags(function (err,posts) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('tags', {
                title: '标签',
                posts: posts,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        })
    });

    /**
     * tags
     * */
    app.get('/tags/:tag',function (req,res) {

        Post.getPostsByTag(req.params.tag,function (err,posts) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('tag', {
                title: 'TAG:' + req.params.tag,
                posts: posts,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        })
    });

    app.get('/search',function (req,res) {
        var keyword = req.query.keyword;
        Post.search(keyword,function (err,posts) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('search', {
                title: "SEARCH:" + req.query.keyword,
                posts: posts,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        })
    });

    app.get('/links',function (req,res) {

        res.render('links',{
            title: '友情链接',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        })
    });


    app.use(function (req, res) {
        res.render("404");
    });
};
