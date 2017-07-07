const router = require('express').Router();
const fs = require('fs');
const checkLogin = require('../middlewares/check').checkLogin;
const checkAdmin = require('../middlewares/check').checkAdmin;
const competitionModels = require('../lib/mongo').Competition;
const userModels = require('../lib/mongo').User;
const itemModels = require('../lib/mongo').Item;
const participantModels = require('../lib/mongo').Participant;
const scoreModels = require('../lib/mongo').Score;

// GET /manage
router.get('/', checkLogin, checkAdmin, (req, res) => {
  res.redirect('/manage/competitions');
});

// GET /manage/competitions
router.get('/competitions', checkLogin, checkAdmin, (req, res) => {
  competitionModels.find({}, (err, competitions) => {
    req.flash('error', err);
    res.render('manage/index', { competitions });
  });
});

// GET /manage/:competitionId/hosts
router.get('/:competitionId/hosts', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;

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
  const competitionId = req.params.competitionId;

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
  const competitionId = req.params.competitionId;

  itemModels.find({
    competition: competitionId,
  }, (err, items) => {
    req.flash('error', err);
    res.render('manage/items', { items });
  });
});

// GET /manage/:competitionId/participants
router.get('/:competitionId/participants', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;

  participantModels.find({
    competition: competitionId,
  }, (err, participants) => {
    req.flash('error', err);
    res.render('manage/participants', { participants });
  });
});

// GET /manage/:competitionId/scores
router.get('/:competitionId/scores', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;

  scoreModels.find({
    competition: competitionId,
  }, (err, scores) => {
    req.flash('error', err);
    res.render('manage/scores', { scores });
  });
});

// DELETE /manage/competitions
// router.delete('/competitions', checkLogin, checkAdmin, (req, res) => {
//   competitionModels.find({}, (err, competitions) => {
//     req.flash('error', err);
//     res.render('manage/index', { competitions });
//   });
// });

// DELETE /manage/:competitionId/:itemId
router.delete('/:competitionId/:itemId', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;
  const itemId = req.params.itemId;

  itemModels.remove({
    _id: itemId,
    competition: competitionId,
  }, (error) => {
    if (error) {
      req.flash('error', `删除失败:${error}`);
      res.redirect('back');
    } else {
      req.flash('success', '删除成功');
      res.redirect(`/manage/${competitionId}/items`);
    }
  });
});

// DELETE /manage/:competitionId/:participantId
router.delete('/:competitionId/:participantId', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;
  const participantId = req.params.participantId;

  participantModels.findOne({
    _id: participantId,
    competition: competitionId,
  }, (err, participant) => {
    if (err) {
      req.flash('error', `删除失败:${err}`);
      res.redirect('back');
    } else {
      fs.unlink(participant.logo);
      fs.unlink(participant.report);

      participantModels.remove({
        _id: participantId,
        competition: competitionId,
      }, (error) => {
        if (error) {
          req.flash('error', `删除失败:${error}`);
          res.redirect('back');
        } else {
          req.flash('success', '删除成功');
          res.redirect(`/manage/${competitionId}/participants`);
        }
      });
    }
  });
});

module.exports = router;
