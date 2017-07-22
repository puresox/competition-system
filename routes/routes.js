const signup = require('./signup');
const signin = require('./signin');
const signout = require('./signout');
const index = require('./index');
const manage = require('./manage');
const rater = require('./rater');
const host = require('./host');
const screen = require('./screen');
const apiCompetitions = require('./api/competitions');
const apiHosts = require('./api/hosts');
const apiRaters = require('./api/raters');
const apiScreen = require('./api/screen');

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

  // 主页
  app.use('/index', index);
  // 后台管理
  app.use('/manage', manage);
  // 大屏幕
  app.use('/screen', screen);
  // 评委
  app.use('/rater', rater);
  // 主持人
  app.use('/host', host);

  // api/competition
  app.use('/api/competitions', apiCompetitions);
  // api/host
  app.use('/api/hosts', apiHosts);
  // api/rater
  app.use('/api/raters', apiRaters);
  // api/screen
  app.use('/api/screen', apiScreen);
};
