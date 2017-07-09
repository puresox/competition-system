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
  }, '_id name competition', (err, hosts) => {
    req.flash('error', err);
    res.render('manage/hosts', { hosts, competitionId });
  });
});

// GET /manage/competitions/:competitionId/raters
router.get('/competitions/:competitionId/raters', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;

  userModels.find({
    role: 2,
    competition: competitionId,
  }, '_id name competition', (err, raters) => {
    req.flash('error', err);
    res.render('manage/raters', { raters, competitionId });
  });
});

// GET /manage/competitions/:competitionId/items
router.get('/competitions/:competitionId/items', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;

  itemModels.find({
    competition: competitionId,
  }, (err, items) => {
    req.flash('error', err);
    res.render('manage/items', { items, competitionId });
  });
});

// GET /manage/competitions/:competitionId/participants
router.get('/competitions/:competitionId/participants', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;

  participantModels.find({
    competition: competitionId,
  }, (err, participants) => {
    req.flash('error', err);
    res.render('manage/participants', { participants, competitionId });
  });
});

// GET /manage/competitions/:competitionId/scores
router.get('/competitions/:competitionId/scores', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;

  scoreModels
    .find({ competition: competitionId })
    .populate('rater', '_id name competition')
    .exec((err, scores) => {
      req.flash('error', err);
      res.render('manage/scores', { scores, competitionId });
    });
});

// POST /manage/competitions
router.post('/competitions', checkLogin, checkAdmin, (req, res) => {
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
    req.flash('error', e.message);
    return res.redirect('back');
  }

  competitionModels.create({
    name,
    // 比赛简介
    introduction,
    // 比赛状态 0 TO DO;1 DOING;2 DONE
    status: 0,
  }, (err) => {
    if (err) {
      req.flash('err', err);
      return res.redirect('back');
    }
    // 写入 flash
    req.flash('success', '新建成功');
    res.redirect('/manage/competitions');
  });
});

// POST /manage/competitions/:competitionId/hosts
router.post('/competitions/:competitionId/hosts', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;
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
    if (!competitionId) {
      throw new Error('无属于的比赛');
    }
  } catch (e) {
    req.flash('error', e.message);
    return res.redirect('back');
  }

  userModels.create({
    name,
    pw: crypto
      .createHash('sha256')
      .update(password)
      .digest('hex'),
    role: 1,
    competition: competitionId,
  }, (err) => {
    if (err) {
      req.flash('err', err);
      return res.redirect('back');
    }
    // 写入 flash
    req.flash('success', '新建成功');
    res.redirect(`/manage/competitions/${competitionId}/hosts`);
  });
});

// POST /manage/competitions/:competitionId/raters
router.post('/competitions/:competitionId/raters', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;
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
    if (!competitionId) {
      throw new Error('无属于的比赛');
    }
  } catch (e) {
    req.flash('error', e.message);
    return res.redirect('back');
  }

  userModels.create({
    name,
    pw: crypto
      .createHash('sha256')
      .update(password)
      .digest('hex'),
    role: 2,
    competition: competitionId,
  }, (err) => {
    if (err) {
      req.flash('err', err);
      return res.redirect('back');
    }
    // 写入 flash
    req.flash('success', '新建成功');
    res.redirect(`/manage/competitions/${competitionId}/raters`);
  });
});

// POST /manage/competitions/:competitionId/items
router.post('/competitions/:competitionId/items', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;
  const name = req.fields.name;

  // 校验参数
  try {
    if (!(name.length >= 1 && name.length <= 30)) {
      throw new Error('名字请限制在 1-30 个字符');
    }
    if (!competitionId) {
      throw new Error('无属于的比赛');
    }
  } catch (e) {
    req.flash('error', e.message);
    return res.redirect('back');
  }

  itemModels.create({
    // 评分项名称
    name,
    // 所属比赛Id
    competition: competitionId,
  }, (err) => {
    if (err) {
      req.flash('err', err);
      return res.redirect('back');
    }
    // 写入 flash
    req.flash('success', '新建成功');
    res.redirect(`/manage/competitions/${competitionId}/items`);
  });
});

// POST /manage/competitions/:competitionId/participants
router.post('/competitions/:competitionId/participants', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;
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
    if (!competitionId) {
      throw new Error('无属于的比赛');
    }
  } catch (e) {
    // 注册失败，异步删除上传文件
    fs.unlink(req.files.logo.path);
    fs.unlink(req.files.report.path);
    req.flash('error', e.message);
    return res.redirect('back');
  }

  participantModels.create({
    // 参赛作品名称
    name,
    // logo [path]
    logo,
    // 作品简介
    introduction,
    // 项目报告书 [path]
    report,
    // 所属比赛Id
    competition: competitionId,
    // 评分状态 0 TO DO;1 DOING;2 DONE
    status: 0,
  }, (err) => {
    if (err) {
      // 注册失败，异步删除上传文件
      fs.unlink(req.files.logo.path);
      fs.unlink(req.files.report.path);
      req.flash('err', err);
      return res.redirect('back');
    }
    // 写入 flash
    req.flash('success', '新建成功');
    res.redirect(`/manage/competitions/${competitionId}/participants`);
  });
});

// PUT /manage/competitions/:competitionId
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
    req.flash('error', e.message);
    return res.redirect('back');
  }

  userModels.update({
    _id: competitionId,
  }, {
    $set: {
      name,
      introduction,
    },
  }, (error) => {
    if (error) {
      req.flash('error', `修改失败:${error}`);
      res.redirect('back');
    } else {
      req.flash('success', '修改成功');
      res.redirect('/manage/competitions');
    }
  });
});

// PUT /manage/competitions/:competitionId/hosts/:hostId
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
    req.flash('error', e.message);
    return res.redirect('back');
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
      req.flash('error', `修改失败:${error}`);
      res.redirect('back');
    } else {
      req.flash('success', '修改成功');
      res.redirect(`/manage/competitions/${competitionId}/hosts`);
    }
  });
});

// PUT /manage/competitions/:competitionId/raters/:raterId
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
    req.flash('error', e.message);
    return res.redirect('back');
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
      req.flash('error', `修改失败:${error}`);
      res.redirect('back');
    } else {
      req.flash('success', '修改成功');
      res.redirect(`/manage/competitions/${competitionId}/raters`);
    }
  });
});

// PUT /manage/competitions/:competitionId/items/:itemId
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
    req.flash('error', e.message);
    return res.redirect('back');
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
      req.flash('error', `修改失败:${error}`);
      res.redirect('back');
    } else {
      req.flash('success', '修改成功');
      res.redirect(`/manage/competitions/${competitionId}/items`);
    }
  });
});

// PUT /manage/competitions/:competitionId/participants/:participantId
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
    req.flash('error', e.message);
    return res.redirect('back');
  }

  participantModels.findOne({
    _id: participantId,
    competition: competitionId,
  }, (err, participant) => {
    if (err) {
      fs.unlink(req.files.logo.path);
      fs.unlink(req.files.report.path);
      req.flash('error', `修改失败:${err}`);
      res.redirect('back');
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
          req.flash('error', `修改失败:${error}`);
          res.redirect('back');
        } else {
          fs.unlink(participant.logo);
          fs.unlink(participant.report);
          req.flash('success', '修改成功');
          res.redirect(`/manage/competitions/${competitionId}/participants`);
        }
      });
    }
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
