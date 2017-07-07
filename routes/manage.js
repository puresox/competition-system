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

// GET /manage/competitions/:competitionId/hosts
router.get('/competitions/:competitionId/hosts', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;

  userModels.find({
    role: 1,
    competition: competitionId,
  }, '_id name', (err, hosts) => {
    req.flash('error', err);
    res.render('manage/hosts', { hosts });
  });
});

// GET /manage/competitions/:competitionId/raters
router.get('/competitions/:competitionId/raters', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;

  userModels.find({
    role: 2,
    competition: competitionId,
  }, '_id name', (err, raters) => {
    req.flash('error', err);
    res.render('manage/raters', { raters });
  });
});

// GET /manage/competitions/:competitionId/items
router.get('/competitions/:competitionId/items', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;

  itemModels.find({
    competition: competitionId,
  }, (err, items) => {
    req.flash('error', err);
    res.render('manage/items', { items });
  });
});

// GET /manage/competitions/:competitionId/participants
router.get('/competitions/:competitionId/participants', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;

  participantModels.find({
    competition: competitionId,
  }, (err, participants) => {
    req.flash('error', err);
    res.render('manage/participants', { participants });
  });
});

// GET /manage/competitions/:competitionId/scores
router.get('/competitions/:competitionId/scores', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;

  scoreModels
    .find({ competition: competitionId })
    .populate('rater', '_id name')
    .exec((err, scores) => {
      req.flash('error', err);
      res.render('manage/scores', { scores });
    });
});

// DELETE /manage/competitions router.delete('/competitions', checkLogin,
// checkAdmin, (req, res) => {   competitionModels.find({}, (err, competitions)
// => {     req.flash('error', err);     res.render('manage/index', {
// competitions });   }); }); DELETE
// /manage/competitions/:competitionId/hosts/:hostId
router.delete('/competitions/:competitionId/hosts/:hostId', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;
  const hostId = req.params.hostId;

  userModels.remove({
    _id: hostId,
    competition: competitionId,
  }, (error) => {
    if (error) {
      req.flash('error', `删除失败:${error}`);
      res.redirect('back');
    } else {
      req.flash('success', '删除成功');
      res.redirect(`/manage/competitions/${competitionId}/hosts`);
    }
  });
});

// DELETE /manage/competitions/:competitionId/raters/:raterId
router.delete('/competitions/:competitionId/raters/:raterId', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;
  const raterId = req.params.raterId;

  userModels.remove({
    _id: raterId,
    competition: competitionId,
  }, (error) => {
    if (error) {
      req.flash('error', `删除失败:${error}`);
      res.redirect('back');
    } else {
      req.flash('success', '删除成功');
      res.redirect(`/manage/competitions/${competitionId}/raters`);
    }
  });
});

// DELETE /manage/competitions/:competitionId/items/:itemId
router.delete('/competitions/:competitionId/items/:itemId', checkLogin, checkAdmin, (req, res) => {
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
      res.redirect(`/manage/competitions/${competitionId}/items`);
    }
  });
});

// DELETE /manage/competitions/:competitionId/participants/:participantId
router.delete('/competitions/:competitionId/participants/:participantId', checkLogin, checkAdmin, (req, res) => {
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
          res.redirect(`/manage/competitions/${competitionId}/participants`);
        }
      });
    }
  });
});

module.exports = router;
