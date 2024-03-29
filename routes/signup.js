const router = require('express').Router();
const adminModels = require('../lib/mongo').Admin;
const crypto = require('crypto');
const checkNotLogin = require('../middlewares/check').checkNotLogin;
const config = require('config-lite')(__dirname);

// GET /signup
router.get('/', checkNotLogin, (req, res) => {
  res.render('signup');
});

// POST /signup
router.post('/', checkNotLogin, (req, res) => {
  const name = req.fields.name;
  const password = req.fields.pw;
  const repassword = req.fields.pw_confirm;
  const invitationCode = req.fields.invitationCode;
  let role;

  // 校验参数
  try {
    if (!(name.length >= 1 && name.length <= 10)) {
      throw new Error('名字请限制在 1-10 个字符');
    }
    if (password.length < 6) {
      throw new Error('密码至少 6 个字符');
    }
    if (password !== repassword) {
      throw new Error('两次输入密码不一致');
    }
    if (invitationCode === config.invitationCode.admin) {
      role = 0;
    } else {
      throw new Error('邀请码不正确');
    }
  } catch (e) {
    req.flash('error', e.message);
    return res.redirect('back');
  }

  adminModels.create({
    name,
    pw: crypto
      .createHash('sha256')
      .update(password)
      .digest('hex'),
    role,
  }, (err, user) => {
    if (err) {
      if (err.message.match('E11000 duplicate key')) {
        req.flash('error', '用户名已被占用');
        res.redirect('back');
      } else {
        req.flash('error', `注册失败：${err}`);
        res.redirect('back');
      }
    } else {
      req.session.user = {
        name: user.name,
        role: user.role,
      };
      req.flash('success', '注册成功');
      res.redirect('/manage');
    }
  });
});

module.exports = router;
