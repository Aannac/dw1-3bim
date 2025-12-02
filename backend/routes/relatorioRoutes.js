const express = require('express');
const router = express.Router();
const relatorioController = require('../controllers/relatorioController');

// Rota para abrir a página de relatórios
router.get('/abrirRelatorios', relatorioController.abrirRelatorios);

// Rotas para buscar dados dos relatórios
router.get('/mes-mais-vendas', relatorioController.mesMaisVendas);
router.get('/clientes-mais-compram', relatorioController.clientesMaisCompram);
router.get('/produtos-mais-vendidos', relatorioController.produtosMaisVendidos);
router.get('/resumo-vendas', relatorioController.resumoVendas);
router.get('/vendas-por-funcionario', relatorioController.vendasPorFuncionario);

module.exports = router;