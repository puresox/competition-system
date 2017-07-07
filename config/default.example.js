module.exports = {
  port: 3000,
  session: {
    secret: 'competitionManage',
    key: 'session_id',
    maxAge: 259200000,
  },
  mongodb: 'mongodb://name:password@localhost:27017/competition',
  invitationCode: {
    admin: '',
  },
};
