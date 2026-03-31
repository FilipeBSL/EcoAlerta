const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/auth');

router.get('/me', authMiddleware, ctrl.getMe);
router.put('/me', authMiddleware, ctrl.updateMe);

module.exports = router;
