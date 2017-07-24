const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const checkLogin = require('../../middlewares/check').checkLogin;
const checkAdmin = require('../../middlewares/check').checkAdmin;
const competitionModels = require('../../lib/mongo').Competition;
const userModels = require('../../lib/mongo').User;
const itemModels = require('../../lib/mongo').Item;
const participantModels = require('../../lib/mongo').Participant;
const scoreModels = require('../../lib/mongo').Score;

// PUT /api/competitions/:competitionId
router.put('/:competitionId', checkLogin, checkAdmin, (req, res) => {
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
router.put('/:competitionId/hosts/:hostId', checkLogin, checkAdmin, (req, res) => {
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
    role: 1,
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
router.put('/:competitionId/raters/:raterId', checkLogin, checkAdmin, (req, res) => {
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
    role: 2,
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

// PUT /api/competitions/:competitionId/screen/:screenId
router.put('/:competitionId/screen/:screenId', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;
  const screenId = req.params.screenId;
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
    _id: screenId,
    role: 3,
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
      res.send({ status: 'success', message: `/manage/competitions/${competitionId}/screen` });
    }
  });
});

// PUT /api/competitions/:competitionId/items/:itemId
router.put('/:competitionId/items/:itemId', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;
  const itemId = req.params.itemId;
  const name = req.fields.name;
  const note = req.fields.note;
  const value = req.fields.value;

  // 校验参数
  try {
    if (!(name.length >= 1 && name.length <= 30)) {
      throw new Error('名字请限制在 1-30 个字符');
    }
    if (!(Number(value) > 0 && Number(value) <= 100)) {
      throw new Error('分值请输入数字');
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
      note,
      value,
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
router.put('/:competitionId/participants/:participantId', checkLogin, checkAdmin, (req, res) => {
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
          fs.unlink(`public/competition/${participant.logo}`);
          fs.unlink(`public/competition/${participant.report}`);
          res.send({ status: 'success', message: `/manage/competitions/${competitionId}/participants` });
        }
      });
    }
  });
});

// DELETE /api/competitions/:competitionId
router.delete('/:competitionId', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;

  Promise
  .all([
    userModels
      .remove({ competition: competitionId })
      .exec(),
    itemModels
      .remove({ competition: competitionId })
      .exec(),
  ])
  .then(() => participantModels.find({ competition: competitionId }).exec()).then((participants) => {
    participants.forEach((participant, i) => {
      fs.unlink(`public/competition/${participant.logo}`);
      fs.unlink(`public/competition/${participant.report}`);

      if (i === participants.length - 1) {
        return participantModels
          .remove({ _id: participant._id, competition: competitionId })
          .exec();
      }

      participantModels
        .remove({ _id: participant._id, competition: competitionId })
        .exec();
    });
  })
  .then(() => competitionModels.remove({ _id: competitionId }).exec())
  .then(() => {
    res.send({ status: 'success', message: '/manage/competitions' });
  })
  .catch((error) => {
    res.send({ status: 'error', message: error });
  });
});

// DELETE /api/competitions/:competitionId/hosts/:hostId
router.delete('/:competitionId/hosts/:hostId', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;
  const hostId = req.params.hostId;

  userModels.remove({
    _id: hostId,
    role: 1,
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
router.delete('/:competitionId/raters/:raterId', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;
  const raterId = req.params.raterId;

  userModels.remove({
    _id: raterId,
    role: 2,
    competition: competitionId,
  }, (error) => {
    if (error) {
      res.send({ status: 'error', message: error });
    } else {
      res.send({ status: 'success', message: `/manage/competitions/${competitionId}/raters` });
    }
  });
});

// DELETE /api/competitions/:competitionId/screen/:screenId
router.delete('/:competitionId/screen/:screenId', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;
  const screenId = req.params.screenId;

  userModels.remove({
    _id: screenId,
    role: 3,
    competition: competitionId,
  }, (error) => {
    if (error) {
      res.send({ status: 'error', message: error });
    } else {
      res.send({ status: 'success', message: `/manage/competitions/${competitionId}/screen` });
    }
  });
});

// DELETE /api/competitions/:competitionId/items/:itemId
router.delete('/:competitionId/items/:itemId', checkLogin, checkAdmin, (req, res) => {
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
router.delete('/:competitionId/participants/:participantId', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;
  const participantId = req.params.participantId;

  participantModels.findOne({
    _id: participantId,
    competition: competitionId,
  }, (err, participant) => {
    if (err) {
      res.send({ status: 'error', message: err });
    } else {
      fs.unlink(`public/competition/${participant.logo}`);
      fs.unlink(`public/competition/${participant.report}`);

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

// PATCH /api/competitions/:competitionId 重新开始比赛
router.patch('/:competitionId', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;

  async function resetCompetition() {
    await scoreModels
      .remove({ competition: competitionId })
      .exec();
    await participantModels.update({
      competition: competitionId,
    }, {
      $set: {
        status: 0,
        order: 0,
        score: 0,
      },
    }).exec();
    await competitionModels
      .update({ _id: competitionId }, { $set: { status: 0, participant: 0 } })
      .exec();
    return true;
  }
  resetCompetition()
  .then(() => {
    res.send({ status: 'success', message: '/manage/competitions' });
  })
  .catch((error) => {
    res.send({ status: 'error', message: error });
  });
});

module.exports = router;
