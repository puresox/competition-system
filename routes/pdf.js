const express = require('express');
const checkLogin = require('../middlewares/check').checkLogin;
const checkRater = require('../middlewares/check').checkRater;
const participantModels = require('../lib/mongo').Participant;

const router = express.Router();

// GET /pdf
router.get('/', checkLogin, checkRater, (req, res, next) => {
  res.render('pdf/viewer')
});

module.exports = router;
