const express = require('express');
const userModels = require('../lib/mongo').User;
const crypto = require('crypto');
const checkNotLogin = require('../middlewares/check').checkNotLogin;

const router = express.Router();

// GET /signin
router.get('/', checkNotLogin, (req, res, next) => {
  res.render('signin');
});

// POST /signin
router.post('/', checkNotLogin, (req, res, next) => {
  const name = req.fields.name;
  const pw = crypto.createHash('sha256').update(req.fields.password).digest('hex');

  userModels
    .findOne({ name })
    .exec((err, user) => {
      if (err) {
        res.redirect('back');
      } else if (pw === user.pw) {
        req.session.user = {
          name: user.name,
          role: user.role,
        };
        res.redirect('/');
      } else {
        res.redirect('back');
      }
    });
});

module.exports = router;
