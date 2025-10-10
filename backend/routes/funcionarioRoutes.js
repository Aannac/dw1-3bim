const express = require('express');
const router = express.Router();
const funcionarioController = require('../controllers/funcionarioController');

// CRUD de Funcionários
router.get('/', funcionarioController.listarFuncionarios);
router.post('/', funcionarioController.criarFuncionario);
router.get('/:cpf', funcionarioController.obterFuncionario);
router.put('/:cpf', funcionarioController.atualizarFuncionario);
router.delete('/:cpf', funcionarioController.deletarFuncionario);

module.exports = router;