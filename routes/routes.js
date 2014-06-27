var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: '主页',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString() });
});

/* GET reg page. */
router.get('/reg', function(req, res) {
    res.render('reg', {
        title: '注册',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
});

/* GET login page. */
router.get('/login', function(req, res) {
    res.render('login', {
        title: '登录',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
});

/* GET logout page. */
router.get('/logout', function(req, res) {
    res.render('logout', {
        title: '退出',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
});

/* GET post page. */
router.get('/post', function(req, res) {
    res.render('post', { title: '发表',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString() });
});


/* GET reg page. */
router.get('/reg', function(req, res) {
    res.render('reg', { title: '注册',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString() });
});

module.exports = router;
