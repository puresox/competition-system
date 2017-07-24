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
router.get('/competitions', checkLogin, checkAdmin, (req, res, next) => {
  competitionModels
    .find({})
    .sort({ _id: 1 })
    .exec()
    .then((competitions) => {
      res.render('manage/index', { competitions });
    })
    .catch(next);
});

// GET /manage/competitions/:competitionId/hosts
router.get('/competitions/:competitionId/hosts', checkLogin, checkAdmin, (req, res, next) => {
  const competitionId = req.params.competitionId;

  userModels.find({
    role: 1,
    competition: competitionId,
  }, '_id name competition')
    .sort({ _id: 1 })
    .exec()
    .then((hosts) => {
      res.render('manage/hosts', { hosts, competitionId });
    })
    .catch(next);
});

// GET /manage/competitions/:competitionId/raters
router.get('/competitions/:competitionId/raters', checkLogin, checkAdmin, (req, res, next) => {
  const competitionId = req.params.competitionId;

  userModels.find({
    role: 2,
    competition: competitionId,
  }, '_id name competition')
    .sort({ _id: 1 })
    .exec()
    .then((raters) => {
      res.render('manage/raters', { raters, competitionId });
    })
    .catch(next);
});

// GET /manage/competitions/:competitionId/screen
router.get('/competitions/:competitionId/screen', checkLogin, checkAdmin, (req, res, next) => {
  const competitionId = req.params.competitionId;

  userModels.find({
    role: 3,
    competition: competitionId,
  }, '_id name competition')
    .sort({ _id: 1 })
    .exec()
    .then((screen) => {
      res.render('manage/screen', { screen, competitionId });
    })
    .catch(next);
});

// GET /manage/competitions/:competitionId/items
router.get('/competitions/:competitionId/items', checkLogin, checkAdmin, (req, res, next) => {
  const competitionId = req.params.competitionId;

  itemModels
    .find({ competition: competitionId })
    .sort({ _id: 1 })
    .exec()
    .then((items) => {
      res.render('manage/items', { items, competitionId });
    })
    .catch(next);
});

// GET /manage/competitions/:competitionId/participants
router.get('/competitions/:competitionId/participants', checkLogin, checkAdmin, (req, res, next) => {
  const competitionId = req.params.competitionId;

  participantModels
    .find({ competition: competitionId })
    .sort({ _id: 1 })
    .exec()
    .then((participants) => {
      res.render('manage/participants', { participants, competitionId });
    })
    .catch(next);
});

// GET /manage/competitions/:competitionId/scores
router.get('/competitions/:competitionId/scores', checkLogin, checkAdmin, (req, res, next) => {
  const competitionId = req.params.competitionId;

  scoreModels
    .find({ competition: competitionId })
    .populate('rater', '_id name competition')
    .populate('participant')
    .sort({ _id: 1 })
    .exec()
    .then((scoresArray) => {
      const scores = scoresArray;
      scoresArray.forEach((raterScore, i) => {
        let sum = 0;
        raterScore
          .scores
          .forEach((itemScore) => {
            sum += itemScore.score;
          });
        scores[i].score = sum;
      });
      res.render('manage/scores', { scores, competitionId });
    })
    .catch(next);
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

  competitionModels
    .create({
      name,
    // 比赛简介
      introduction,
    // 比赛状态 0 比赛未开始;1 抽签;2 比赛开始;3 比赛结束
      status: 0,
    // 正在进行的参赛作品抽签序号
      participant: 0,
    })
    .then(competition => itemModels.create({
      // 评分项名称
      name: '总分',
      // 备注
      note: '总分',
      // 分值
      value: 100,
      // 所属比赛Id
      competition: competition._id,
    }))
    .then(() => {
      req.flash('success', '新建成功');
      res.redirect('/manage/competitions');
    })
    .catch((err) => {
      req.flash('err', err);
      res.redirect('back');
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

// POST /manage/competitions/:competitionId/screen
router.post('/competitions/:competitionId/screen', checkLogin, checkAdmin, (req, res) => {
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
    role: 3,
    competition: competitionId,
  }, (err) => {
    if (err) {
      req.flash('err', err);
      return res.redirect('back');
    }
    // 写入 flash
    req.flash('success', '新建成功');
    res.redirect(`/manage/competitions/${competitionId}/screen`);
  });
});

// POST /manage/competitions/:competitionId/items
router.post('/competitions/:competitionId/items', checkLogin, checkAdmin, (req, res) => {
  const competitionId = req.params.competitionId;
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
    // 备注
    note,
    // 分值
    value,
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
    // 抽签顺序
    order: 0,
    // 分数
    score: 0,
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

module.exports = router;
