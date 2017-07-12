const router = require('express').Router();

// GET /api/screen
router.get('/', (req, res) => {
  const competition = req.session.user.competition;
  res.render('screen/index', { competition });
});

module.exports = router;
