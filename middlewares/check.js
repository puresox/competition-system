module.exports = {
  checkLogin: function checkLogin(req, res, next) {
    if (!req.session.user) {
      req.flash('error', '未登录');
      return res.redirect('/signin');
    }
    next();
  },

  checkNotLogin: function checkNotLogin(req, res, next) {
    if (req.session.user) {
      req.flash('error', '已登录');
      return res.redirect('back');// 返回之前的页面
    }
    next();
  },

  checkAdmin: function checkAdmin(req, res, next) {
    if (req.session.user.role !== 0) {
      req.flash('error', '您不是管理员');
      return res.redirect('back');// 返回之前的页面
    }
    next();
  },

  checkHost: function checkHost(req, res, next) {
    if (req.session.user.role !== 1) {
      req.flash('error', '您不是主持人');
      return res.redirect('back');// 返回之前的页面
    }
    next();
  },

  checkRater: function checkRater(req, res, next) {
    if (req.session.user.role !== 2) {
      req.flash('error', '您不是评委');
      return res.redirect('back');// 返回之前的页面
    }
    next();
  },
};
