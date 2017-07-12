const router = require('express').Router();
const scoreModels = require('../../lib/mongo').Score;
const checkLogin = require('../../middlewares/check').checkLogin;
const checkRater = require('../../middlewares/check').checkRater;

// GET /api/raters/participant?p=***
router.get('/participant', checkLogin, checkRater, (req, res) => {
  res.render('rater/index');
});

// GET /api/raters/score?p=***
router.get('/score', checkLogin, checkRater, (req, res) => {
  res.render('rater/index');
});

// GET /api/raters/raterScore?p=***
router.get('/raterScore', checkLogin, checkRater, (req, res) => {
  res.render('score/index');
});

// POST /api/raters/raterScore
router.post('/raterScore', checkLogin, checkRater, (req, res) => {
  scoreModels.create({ size: 'small' })
    .then((score) => {
      res.render('score/index');
    })
    .catch();
});

// POST /api/raters/judges
router.get('/judges', checkLogin, checkRater, (req, res) => {
  res.render('score/index_judges');
});

// GET /api/raters/refer
router.get('/refer', checkLogin, checkRater, (req, res) => {
  res.render('score/index_referee');
});
