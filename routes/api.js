const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const checkLogin = require('../middlewares/check').checkLogin;
const checkAdmin = require('../middlewares/check').checkAdmin;
const competitionModels = require('../lib/mongo').Competition;
const userModels = require('../lib/mongo').User;
const itemModels = require('../lib/mongo').Item;
const participantModels = require('../lib/mongo').Participant;

// PUT /api/competitions/:competitionId
router.put('/competitions/:competitionId', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;
  const name = req.fields.name;
  const introduction = req.fields.introduction;

    // 校验参数
  try {
    if (!(name.length >= 1 && name.length <= 30)) {
      throw new Error('名字请限制在 1-30 个字符');
    }
    if (!(introduction.length >= 1 && introduction.length <= 1000)) {
      throw new Error('简介请限制在 1-1000 个字符');
    }
  } catch (e) {
    return res.send({ status: 'error', message: e.message });
  }

  competitionModels.findByIdAndUpdate(competitionId, {
    $set: {
      name,
      introduction,
    },
  }, (error) => {
    if (error) {
      res.send({ status: 'error', message: error });
    } else {
      res.send({ status: 'success', message: '/manage/competitions' });
    }
  });
});

// PUT /api/competitions/:competitionId/hosts/:hostId
router.put('/competitions/:competitionId/hosts/:hostId', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;
  const hostId = req.params.hostId;
  const name = req.fields.name;
  const password = req.fields.password;
  const repassword = req.fields.repassword;

    // 校验参数
  try {
    if (!(name.length >= 1 && name.length <= 30)) {
      throw new Error('名字请限制在 1-30 个字符');
    }
    if (password.length < 6) {
      throw new Error('密码至少 6 个字符');
    }
    if (password !== repassword) {
      throw new Error('两次输入密码不一致');
    }
  } catch (e) {
    return res.send({ status: 'error', message: e.message });
  }

  userModels.update({
    _id: hostId,
    competition: competitionId,
  }, {
    $set: {
      name,
      pw: crypto
                .createHash('sha256')
                .update(password)
                .digest('hex'),
    },
  }, (error) => {
    if (error) {
      res.send({ status: 'error', message: error });
    } else {
      res.send({ status: 'success', message: `/manage/competitions/${competitionId}/hosts` });
    }
  });
});

// PUT /api/competitions/:competitionId/raters/:raterId
router.put('/competitions/:competitionId/raters/:raterId', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;
  const raterId = req.params.raterId;
  const name = req.fields.name;
  const password = req.fields.password;
  const repassword = req.fields.repassword;

    // 校验参数
  try {
    if (!(name.length >= 1 && name.length <= 30)) {
      throw new Error('名字请限制在 1-30 个字符');
    }
    if (password.length < 6) {
      throw new Error('密码至少 6 个字符');
    }
    if (password !== repassword) {
      throw new Error('两次输入密码不一致');
    }
  } catch (e) {
    return res.send({ status: 'error', message: e.message });
  }

  userModels.update({
    _id: raterId,
    competition: competitionId,
  }, {
    $set: {
      name,
      pw: crypto
                .createHash('sha256')
                .update(password)
                .digest('hex'),
    },
  }, (error) => {
    if (error) {
      res.send({ status: 'error', message: error });
    } else {
      res.send({ status: 'success', message: `/manage/competitions/${competitionId}/raters` });
    }
  });
});

// PUT /api/competitions/:competitionId/items/:itemId
router.put('/competitions/:competitionId/items/:itemId', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;
  const itemId = req.params.itemId;
  const name = req.fields.name;

    // 校验参数
  try {
    if (!(name.length >= 1 && name.length <= 30)) {
      throw new Error('名字请限制在 1-30 个字符');
    }
  } catch (e) {
    return res.send({ status: 'error', message: e.message });
  }

  itemModels.update({
    _id: itemId,
    competition: competitionId,
  }, {
    $set: {
      name,
    },
  }, (error) => {
    if (error) {
      res.send({ status: 'error', message: error });
    } else {
      res.send({ status: 'success', message: `/manage/competitions/${competitionId}/items` });
    }
  });
});

// PUT /api/competitions/:competitionId/participants/:participantId
router.put('/competitions/:competitionId/participants/:participantId', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;
  const participantId = req.params.participantId;
  const name = req.fields.name;
  const introduction = req.fields.introduction;
  const logo = req
        .files
        .logo
        .path
        .split(path.sep)
        .pop();
  const report = req
        .files
        .report
        .path
        .split(path.sep)
        .pop();

    // 校验参数
  try {
    if (!(name.length >= 1 && name.length <= 30)) {
      throw new Error('名字请限制在 1-30 个字符');
    }
    if (!(introduction.length >= 1 && introduction.length <= 1000)) {
      throw new Error('简介请限制在 1-1000 个字符');
    }
    if (!req.files.logo.name) {
      throw new Error('缺少logo');
    }
    if (!req.files.report.name) {
      throw new Error('缺少项目报告书');
    }
  } catch (e) {
        // 注册失败，异步删除上传文件
    fs.unlink(req.files.logo.path);
    fs.unlink(req.files.report.path);
    return res.send({ status: 'error', message: e.message });
  }

  participantModels.findOne({
    _id: participantId,
    competition: competitionId,
  }, (err, participant) => {
    if (err) {
      fs.unlink(req.files.logo.path);
      fs.unlink(req.files.report.path);
      res.send({ status: 'error', message: err });
    } else {
      const updateParticipant = participant;
      updateParticipant.name = name;
      updateParticipant.logo = logo;
      updateParticipant.introduction = introduction;
      updateParticipant.report = report;

      updateParticipant.save((error) => {
        if (error) {
          fs.unlink(req.files.logo.path);
          fs.unlink(req.files.report.path);
          res.send({ status: 'error', message: error });
        } else {
          fs.unlink(participant.logo);
          fs.unlink(participant.report);
          res.send({ status: 'success', message: `/manage/competitions/${competitionId}/participants` });
        }
      });
    }
  });
});

// DELETE /api/competitions router.delete('/competitions', checkLogin,
// checkAdmin, (req, res) => {   competitionModels.find({}, (err, competitions)
// => {     req.flash('error', err);     res.render('manage/index', {
// competitions });   }); }); DELETE
// /api/competitions/:competitionId/hosts/:hostId
router.delete('/competitions/:competitionId/hosts/:hostId', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;
  const hostId = req.params.hostId;

  userModels.remove({
    _id: hostId,
    competition: competitionId,
  }, (error) => {
    if (error) {
      res.send({ status: 'error', message: error });
    } else {
      res.send({ status: 'success', message: `/manage/competitions/${competitionId}/hosts` });
    }
  });
});

// DELETE /api/competitions/:competitionId/raters/:raterId
router.delete('/competitions/:competitionId/raters/:raterId', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;
  const raterId = req.params.raterId;

  userModels.remove({
    _id: raterId,
    competition: competitionId,
  }, (error) => {
    if (error) {
      res.send({ status: 'error', message: error });
    } else {
      res.send({ status: 'success', message: `/manage/competitions/${competitionId}/raters` });
    }
  });
});

// DELETE /api/competitions/:competitionId/items/:itemId
router.delete('/competitions/:competitionId/items/:itemId', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;
  const itemId = req.params.itemId;

  itemModels.remove({
    _id: itemId,
    competition: competitionId,
  }, (error) => {
    if (error) {
      res.send({ status: 'error', message: error });
    } else {
      res.send({ status: 'success', message: `/manage/competitions/${competitionId}/items` });
    }
  });
});

// DELETE /api/competitions/:competitionId/participants/:participantId
router.delete('/competitions/:competitionId/participants/:participantId', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;
  const participantId = req.params.participantId;

  participantModels.findOne({
    _id: participantId,
    competition: competitionId,
  }, (err, participant) => {
    if (err) {
      res.send({ status: 'error', message: err });
    } else {
      fs.unlink(participant.logo);
      fs.unlink(participant.report);

      participantModels.remove({
        _id: participantId,
        competition: competitionId,
      }, (error) => {
        if (error) {
          res.send({ status: 'error', message: error });
        } else {
          res.send({ status: 'success', message: `/manage/competitions/${competitionId}/participants` });
        }
      });
    }
  });
});

module.exports = router;