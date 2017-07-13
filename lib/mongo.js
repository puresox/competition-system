const config = require('config-lite')(__dirname);
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
mongoose.connect(config.mongodb, { useMongoClient: true });

// 管理员
exports.Admin = mongoose.model('Admin', new Schema({
  name: {
    type: String,
    unique: true,
    index: true,
  },
  pw: String,
  // 角色 0管理员 为所欲为
  role: Number,
}));

// 主持人 评委
exports.User = mongoose.model('User', new Schema({
  name: {
    type: String,
    index: true,
  },
  pw: String,
  // 角色 1主持人 掌握比赛进度;2评委 评分;3屏幕 展示
  role: Number,
  // 主持人和评委所属的比赛Id
  competition: {
    type: Schema.Types.ObjectId,
    ref: 'Competition',
  },
}));

// 作品评分项
exports.Item = mongoose.model('Item', new Schema({
  name: {
    type: String,
    index: true,
  },
  // 分值
  value: Number,
  // 所属比赛Id
  competition: {
    type: Schema.Types.ObjectId,
    ref: 'Competition',
  },
}));

// 作品分数
exports.Score = mongoose.model('Score', new Schema({
  // 所属比赛Id
  competition: {
    type: Schema.Types.ObjectId,
    ref: 'Competition',
  },
  // 参赛作品
  participant: {
    type: Schema.Types.ObjectId,
    ref: 'Participant',
  },
  // 评委Id
  rater: {
    type: Schema.Types.ObjectId,
    index: true,
    ref: 'User',
  },
  // 各项打分
  scores: [
    {
      item: {
        type: Schema.Types.ObjectId,
        ref: 'Item',
      },
      score: Number,
    },
  ],
}));

// 参赛作品
exports.Participant = mongoose.model('Participant', new Schema({
  // 参赛作品名称
  name: {
    type: String,
    index: true,
  },
  // logo [path]
  logo: String,
  // 作品简介
  introduction: String,
  // 项目报告书 [path]
  report: String,
  // 所属比赛Id
  competition: {
    type: Schema.Types.ObjectId,
    ref: 'Competition',
  },
  // 抽签序号
  order: Number,
  // 评分状态 0 TO DO;1 DOING;2 DONE
  status: Number,
  // 分数
  score: Number,
}));

// 比赛
exports.Competition = mongoose.model('Competition', new Schema({
  // 比赛名称
  name: {
    type: String,
    index: true,
  },
  // 比赛简介
  introduction: String,
  // 比赛状态 0 比赛未开始;1 抽签结束，准备开始;2 比赛开始;3 比赛结束
  status: Number,
  // 正在进行的参赛作品抽签序号
  participant: Number,
}));
