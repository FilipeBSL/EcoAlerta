const router = require('express').Router();
const { apiLimiter } = require('../middlewares/rateLimiter');

router.use(apiLimiter);
router.use('/auth', require('./auth'));
router.use('/denuncias', require('./denuncias'));
router.use('/mapa', require('./mapa'));
router.use('/relatorios', require('./relatorios'));
router.use('/bairros', require('./bairros'));
router.use('/usuarios', require('./usuarios'));

module.exports = router;
