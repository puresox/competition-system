const enroll = require('./enroll');
const score = require('./score');
const index = require('./index');
const signup = require('./signup');
const signin = require('./signin');
const signout = require('./signout');
const draw = require('./draw');
const manage = require('./manage');

module.exports = (app) => {
  app.get('/', (req, res) => {
    res.redirect('/index');
  });

  // 注册
  app.use('/signup', signup);
  // 登录
  app.use('/signin', signin);
  // 登出
  app.use('/signout', signout);
  // 报名
  app.use('/enroll', enroll);
  // 评分
  app.use('/score', score);
  // 主页
  app.use('/index', index);
  // 抽签
  app.use('/draw', draw);
  // 后台管理
  app.use('/manage', manage);

  // 404 page
  app.use((req, res) => {
    if (!res.headersSent) {
      res.status(404).render('error');
    }
  });
};
