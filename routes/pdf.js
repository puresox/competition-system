const express = require('express');
const checkLogin = require('../middlewares/check').checkLogin;
const checkRater = require('../middlewares/check').checkRater;
const participantModels = require('../lib/mongo').Participant;

const router = express.Router();

// GET /pdf/:participantId
router.get('/:participantId', checkLogin, checkRater, (req, res, next) => {
  const participantId = req.params.participantId;

  participantModels
    .findById(participantId)
    .exec()
    .then((participant) => {
      res.render('pdf/viewer', { pdf: participant.report });
    })
    .catch(next);
});

module.exports = router;
