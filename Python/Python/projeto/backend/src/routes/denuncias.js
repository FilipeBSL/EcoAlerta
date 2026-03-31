const router = require('express').Router();
const ctrl = require('../controllers/denunciaController');
const { authMiddleware } = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const upload = require('../middlewares/upload');

router.post('/', authMiddleware, authorize('cidadao'), upload.array('fotos', 3), ctrl.create);
router.get('/', authMiddleware, ctrl.list);
router.get('/:id', authMiddleware, ctrl.findById);
router.patch('/:id/status', authMiddleware, authorize('administrador'), ctrl.updateStatus);
router.delete('/:id', authMiddleware, authorize('cidadao'), ctrl.cancel);

module.exports = router;
