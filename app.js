var express = require('express'),
    path = require('path'),
    flash = require('connect-flash'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    favicon = require('static-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    crypto = require('crypto'),
    settings = require('./settings'),
    User = require('./models/user');

var routes = require('./routes/routes');

var app = express();


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({
    secret: settings.cookieSecret,
    key: settings.db,//cookie name
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
    store: new MongoStore({
        db: settings.db
    })
}));

app.use(express.static(path.join(__dirname, 'public')));

/** routes **/

app.use(routes);

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


/*
* reg
* */
app.post('/reg', function (req, res) {
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

/*
* login
* */

app.post('/login', function (req, res) {
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

/*
* logout
* */
app.get('/logout', function (req, res) {
    req.session.user = null;
    req.flash('success', '登出成功');
    res.redirect('/');
});


























if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});




app.listen(3000);
module.exports = app;




























