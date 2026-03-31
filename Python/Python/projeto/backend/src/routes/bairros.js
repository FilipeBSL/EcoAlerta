const router = require('express').Router();
const ctrl = require('../controllers/bairroController');

router.get('/', ctrl.list);

module.exports = router;
