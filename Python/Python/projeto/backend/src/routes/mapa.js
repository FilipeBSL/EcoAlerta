const router = require('express').Router();
const ctrl = require('../controllers/mapaController');

router.get('/pontos', ctrl.getPontos);

module.exports = router;
