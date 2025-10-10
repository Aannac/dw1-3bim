const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

// Rota para abrir a página de login
router.get('/abrirLogin', loginController.abrirLogin);

// Rota para verificar autenticação
router.post('/verificar', loginController.verificarLogin);

// Rota para logout
router.post('/logout', loginController.logout);

module.exports = router;