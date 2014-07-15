var express = require('express'),
    router = express.Router(),
    crypto = require('crypto'),
    User = require('./../models/user'),
    Post = require('./../models/post'),
    Comment = require('./../models/comment'),
    markdown = require('markdown').markdown;

function checkLogin (req, res, next) {
    if (!req.session.user) {
        req.flash('error', '未登录');
        req.redirect('/login');
    }
    next();
}

function checkNotLogin (req, res, next) {
    if (req.session.user) {
        req.flash('error', '已登录');
        req.redirect('back');
    }
    next();
}

/* GET home page. */
router.get('/', function(req, res) {
    var page = req.query.p ? parseInt(req.query.p) : 1;
    Post.getAll(null, page, function (err, posts, total) {
        if (err) {
            posts = [];
        }
        posts.forEach(function (doc) {
            doc.post = markdown.toHTML(doc.post);
        });
        res.render('index', {
            title: '主页',
            user: req.session.user,
            posts: posts,
            page: page,
            isFirstPage: (page - 1) == 0,
            isLastPage: ((page - 1) * 10 + posts.length) == total,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });

    });

});

/* GET reg page. */
router.get('/reg', checkNotLogin);
router.get('/reg', function(req, res) {
    res.render('reg', {
        title: '注册',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
});

/* GET login page. */
router.get('/login', checkNotLogin);
router.get('/login', function(req, res) {
    res.render('login', {
        title: '登录',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
});

router.post('/login',checkNotLogin);
router.post('/login', function (req, res) {
    var name = req.body.name,
        password,
        md5 = crypto.createHash('md5');
    password = md5.update(req.body.password).digest('hex');
    User.get(name, function (err, user) {
        if (!user) {
            req.flash('error', '用户名不存在');
        } else if (user.password != password) {
            req.flash('error', '用户名或密码错误');
        } else {
            req.session.user = user;
            req.flash('success', '登录成功');
            res.redirect('/');
        }

    });
});

/* GET logout page. */
router.get('/logout', checkLogin);
router.get('/logout', function(req, res) {
    req.session.user = null;
    req.flash('success', '登出成功');
    res.redirect('/');
});

/* GET post page. */
router.get('/post', checkLogin);
router.get('/post', function(req, res) {
    res.render('post', {
        title: '发表',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString() });
});

router.post('/post', checkLogin);
router.post('/post', function (req, res) {
    var currentUser = req.session.user,
        post = new Post(currentUser.name, req.body.title, req.body.post);
    post.save(function (err) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        req.flash('success', '发布成功');
        res.redirect('/');
    });

});

/* GET reg page. */
router.get('/reg', checkNotLogin);
router.get('/reg', function(req, res) {
    res.render('reg', { title: '注册',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString() });
});

router.post('/reg', checkNotLogin);
router.post('/reg', function (req, res) {
    var name = req.body.name,
        password = req.body.password,
        password_re = req.body['password-repeat'];

    if (password_re != password) {
        req.flash('error', '两次输入的密码不一致!');
        return res.redirect('/reg');//返回注册页
    }
    //生成密码的 md5 值
    var md5 = crypto.createHash('md5');
    password = md5.update(req.body.password).digest('hex');
    var newUser = new User({
        name: name,
        password: password
    });

    User.get(newUser.name, function (err, user) {
        if (user) {
            req.flash('error', '用户已存在!');
            return res.redirect('/reg');
        }

        newUser.save(function (err, user) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/reg');
            }
            req.session.user = user;
            req.flash('success', '注册成功!');
            res.redirect('/');
        });
    });
});

/* articles of the user */
router.get('/u/:name', function (req, res) {
    var page = req.query.p ? parseInt(req.query.p) : 1;
    User.get(req.params.name, function (err, user) {
        if (!user) {
            req.flash('error', '用户不存在！');
            return res.redirect('/');
        }

        Post.getAll(user.name, page, function (err, posts, total) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            posts.forEach(function (doc) {
                doc.post = markdown.toHTML(doc.post);
            });
            res.render('user', {
                title: user.name,
                posts: posts,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 10 + posts.length) == total,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    })
});

/* single article */
router.get('/u/:name/:day/:title', function (req, res) {
    Post.getOne(req.params.name, req.params.day, req.params.title, function (err, doc) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        doc.post = markdown.toHTML(doc.post);
        doc.comments.forEach(function (comment) {
            comment.content = markdown.toHTML(comment.content);
        });
        res.render('article', {
            title: req.param.title,
            post: doc,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
});
router.post('/u/:name/:day/:title', function (req, res) {
    var date = new Date(),
        time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + " " + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());

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
        req.flash('success', '留言成功');
        res.redirect('back');
    });



});





/* edit */
router.get('/edit/:name/:day/:title', checkLogin);
router.get('/edit/:name/:day/:title', function (req, res) {
    var currentUser = req.session.user;
    Post.getOne(currentUser.name, req.params.day, req.params.title, function (err, post) {
        if (err) {
            req.flash('error', err);
            return res.redirect('back');
        }
        res.render('edit', {
            title: '编辑',
            post: post,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
});

/* edit */
router.post('/edit/:name/:day/:title', checkLogin);
router.post('/edit/:name/:day/:title', function (req, res) {
    var currentUser = req.session.user;
    Post.update(currentUser.name, req.params.day, req.params.title, req.body.post, function (err) {
        var url = '/u/' + req.params.name + '/' + req.params.day + '/' + req.params.title;
        if (err) {
            req.flash('error', err);
            return res.redirect(url);
        }
        req.flash('success', '修改成功!');
        res.redirect(url);
    });
});

router.get('/remove/:name/:day/:title', checkLogin);
router.get('/remove/:name/:day/:title', function (req, res) {
    var currentUser = req.session.user;
    Post.remove(currentUser.name, req.params.day, req.params.title, function (err) {
        if (err) {
            req.flash('err', err);
            return res.redirect('/');
        }
        req.flash('success', '删除成功！');
        res.redirect('/');
    });
});





module.exports = router;
