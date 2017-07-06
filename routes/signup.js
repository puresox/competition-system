const express = require('express');
const userModels = require('../lib/mongo').User;
const crypto = require('crypto');
const checkNotLogin = require('../middlewares/check').checkNotLogin;
const config = require('config-lite')(__dirname);

const router = express.Router();

// GET /signup
router.get('/', checkNotLogin, (req, res, next) => {
  res.render('signup');
});

// POST /signup
router.post('/', checkNotLogin, (req, res, next) => {
  const name = req.fields.name;
  const pw = req.fields.pw;
  const pwConfirm = req.fields.pw_confirm;
  const invitationCode = req.fields.invitationCode;
  let role;

  if (invitationCode === config.invitationCode.admin) {
    role = 0;
  } else if (invitationCode === config.invitationCode.host) {
    role = 1;
  } else if (invitationCode === config.invitationCode.rater) {
    role = 2;
  } else {
    return res.redirect('back');
  }

  if (pw === pwConfirm) {
    userModels.create({
      name,
      pw: crypto.createHash('sha256').update(pw).digest('hex'),
      role,
    }, (err, user) => {
      if (err) {
        res.redirect('back');
      } else {
        req.session.user = {
          name: user.name,
          role: user.role,
        };
        res.redirect('/');
      }
    });
  } else {
    res.redirect('back');
  }
});

module.exports = router;
