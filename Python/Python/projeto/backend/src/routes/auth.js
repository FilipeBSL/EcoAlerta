const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/auth');
const { loginLimiter } = require('../middlewares/rateLimiter');

router.post('/register', ctrl.register);
router.post('/login', loginLimiter, ctrl.login);
router.post('/logout', authMiddleware, ctrl.logout);

module.exports = router;
