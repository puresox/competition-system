const router = require('express').Router();
const itemModels = require('../lib/mongo').Item;
const checkLogin = require('../middlewares/check').checkLogin;
const checkRater = require('../middlewares/check').checkRater;

// GET /rater
router.get('/', checkLogin, checkRater, (req, res, next) => {
  const competition = req.session.user.competition;

  itemModels.find({
    competition: competition._id,
  }).exec()
  .then((items) => {
    res.render('rater/index', { competition, items });
  })
  .catch(next);
});

module.exports = router;
