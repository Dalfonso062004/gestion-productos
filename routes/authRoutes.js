const express = require('express');
const { registerUser, loginUser, getPerfil } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/perfil', protect, getPerfil);

module.exports = router;