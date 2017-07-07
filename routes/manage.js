const router = require('express').Router();
const checkLogin = require('../middlewares/check').checkLogin;
const checkAdmin = require('../middlewares/check').checkAdmin;
const competitionModels = require('../lib/mongo').Competition;
const userModels = require('../lib/mongo').User;
const itemModels = require('../lib/mongo').Item;
const participantModels = require('../lib/mongo').Participant;
const scoreModels = require('../lib/mongo').Score;

// GET /manage
router.get('/', checkLogin, checkAdmin, (req, res) => {
  competitionModels.find({}, (err, competitions) => {
    req.flash('error', err);
    res.render('manage/index', { competitions });
  });
});

// GET /manage/:competitionId/hosts
router.get('/:competitionId/hosts', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competition;
  userModels.find({
    role: 1,
    competition: competitionId,
  }, 'name', (err, hosts) => {
    req.flash('error', err);
    res.render('manage/hosts', { hosts });
  });
});

// GET /manage/:competitionId/raters
router.get('/:competitionId/raters', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competition;
  userModels.find({
    role: 2,
    competition: competitionId,
  }, 'name', (err, raters) => {
    req.flash('error', err);
    res.render('manage/raters', { raters });
  });
});

// GET /manage/:competitionId/items
router.get('/:competitionId/items', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competition;
  itemModels.find({
    competition: competitionId,
  }, (err, items) => {
    req.flash('error', err);
    res.render('manage/items', { items });
  });
});

// GET /manage/:competitionId/participants
router.get('/:competitionId/participants', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competition;
  participantModels.find({
    competition: competitionId,
  }, (err, participants) => {
    req.flash('error', err);
    res.render('manage/participants', { participants });
  });
});

// GET /manage/:competitionId/scores
router.get('/:competitionId/scores', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competition;
  scoreModels.find({
    competition: competitionId,
  }, (err, scores) => {
    req.flash('error', err);
    res.render('manage/scores', { scores });
  });
});

module.exports = router;
