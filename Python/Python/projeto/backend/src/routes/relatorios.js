const router = require('express').Router();
const ctrl = require('../controllers/relatorioController');
const { authMiddleware } = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

router.get('/indicadores', authMiddleware, authorize('administrador'), ctrl.getIndicadores);
router.get('/exportar', authMiddleware, authorize('administrador'), ctrl.exportarCSV);

module.exports = router;
