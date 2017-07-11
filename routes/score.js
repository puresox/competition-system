const router = require('express').Router();
const scoreModels = require('../lib/mongo').Score;
// const checkNotLogin = require('../middlewares/check').checkNotLogin;
// const checkLogin = require('../middlewares/check').checkLogin;

// GET /score
router.get('/', (req, res, next) => {
  res.render('score/index');
});

// GET /score/participant?p=***
router.get('/participant', (req, res, next) => {
  res.render('score/index');
});

// GET /score/score?p=***
router.get('/score', (req, res, next) => {
  res.render('score/index');
});

// GET /score/raterScore?p=***
router.get('/raterScore', (req, res, next) => {
  res.render('score/index');
});

// POST /score/raterScore
router.post('/raterScore', (req, res, next) => {
  scoreModels.create({ size: 'small' })
    .then((score) => {
      res.render('score/index');
    })
    .catch();
});

module.exports = router;
