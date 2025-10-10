const express = require('express');
const router = express.Router();
const pedido_has_produtoController = require('./../controllers/pedido_has_produtoController');

// CRUD de Pedido_has_produtos

router.get('/abrirCrudPedido_has_produto', pedido_has_produtoController.abrirCrudPedido_has_produto);
router.get('/', pedido_has_produtoController.listarPedido_has_produtos);
router.post('/', pedido_has_produtoController.criarPedido_has_produto);
router.get('/:id', pedido_has_produtoController.obterPedido_has_produto);
router.put('/:id', pedido_has_produtoController.atualizarPedido_has_produto);
router.delete('/:id', pedido_has_produtoController.deletarPedido_has_produto);

module.exports = router;
