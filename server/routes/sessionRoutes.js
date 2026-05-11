const express = require('express');
const router = express.Router();
const { openSession, closeSession, getActiveSession, getSessions } = require('../controllers/sessionController');

router.post('/open', openSession);
router.put('/close/:id', closeSession);
router.get('/active', getActiveSession);
router.get('/', getSessions);

module.exports = router;
