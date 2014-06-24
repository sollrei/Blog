var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: '主页' });
});

/* GET login page. */
router.get('/login', function(req, res) {
    res.render('login', { title: '登录' });
});

/* GET logout page. */
router.get('/logout', function(req, res) {
    res.render('logout', { title: '退出' });
});

/* GET post page. */
router.get('/post', function(req, res) {
    res.render('post', { title: '发表' });
});


/* GET reg page. */
router.get('/reg', function(req, res) {
    res.render('reg', { title: '注册' });
});

module.exports = router;
