const router = require('express').Router();
const userModels = require('../lib/mongo').User;
const adminModels = require('../lib/mongo').Admin;
const crypto = require('crypto');
const checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /signin
router.get('/', checkNotLogin, (req, res) => {
  res.render('signin');
});

// POST /signin
router.post('/', checkNotLogin, (req, res) => {
  const name = req.fields.name;
  const pw = crypto
    .createHash('sha256')
    .update(req.fields.password)
    .digest('hex');

  userModels
    .findOne({ name })
    .populate('competition')
    .exec((err, user) => {
      if (err) {
        req.flash('error', `登录失败：${err}`);
        res.redirect('back');
      } else if (!user) {
        adminModels
          .findOne({ name })
          .exec((error, admin) => {
            if (error) {
              req.flash('error', `登录失败：${error}`);
              res.redirect('back');
            } else if (!admin) {
              req.flash('error', '用户不存在');
              res.redirect('back');
            } else if (pw === admin.pw) {
              req.session.user = {
                id: admin._id,
                name: admin.name,
                role: admin.role,
              };
              req.flash('success', '登录成功');
              res.redirect('/manage');
            } else {
              req.flash('error', '用户名或密码错误');
              res.redirect('back');
            }
          });
      } else if (pw === user.pw) {
        req.session.user = {
          id: user._id,
          name: user.name,
          role: user.role,
          competition: user.competition,
        };
        if (user.role === 1) {
          req.flash('success', '登录成功');
          res.redirect('/host');
        } else if (user.role === 2) {
          req.flash('success', '登录成功');
          res.redirect('/rater');
        } else {
          req.flash('error', '身份认证失败');
          res.redirect('back');
        }
      } else {
        req.flash('error', '用户名或密码错误');
        res.redirect('back');
      }
    });
});

module.exports = router;
