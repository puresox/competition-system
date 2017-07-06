const config = require('config-lite')(__dirname);
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
mongoose.connect(config.mongodb, { useMongoClient: true });

// 用户
exports.User = mongoose.model('User', new Schema({
  name: { type: String, unique: true, index: true },
  pw: String,
  // 角色 0管理员;1主持人;2评委
  role: Number,
}));

// 作品分数
exports.Score = mongoose.model('Score', new Schema({
  // 参赛作品
  participant: String,
  // 评委
  rater: { type: String, index: true },
  // 评分状态 0 TO DO;1 DOING;2 DONE
  status: Number,
  // 各项打分
  scores: [Number],
}));

// 参赛作品
exports.Participant = mongoose.model('Participant', new Schema({
  // 参赛作品名称
  name: { type: String, index: true },
  // logo [path]
  logo: String,
  // 比赛简介
  introduction: String,
  // 项目报告书 [path]
  report: String,
  // 比赛顺序
  order: Number,
  // 比赛状态 0 TO DO;1 DOING;2 DONE
  status: Number,
}));

// 比赛
exports.Competition = mongoose.model('Competition', new Schema({
  // 比赛名称
  name: { type: String, index: true },
}));
