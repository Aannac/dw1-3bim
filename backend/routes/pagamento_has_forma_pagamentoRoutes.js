const express = require('express');
const router = express.Router();
const pagamento_has_forma_pagamentoController = require('./../controllers/pagamento_has_forma_pagamentoController');

// CRUD de Pagamento_has_forma_pagamento

router.get('/', pagamento_has_forma_pagamentoController.listarPagamentoFormas);
router.post('/', pagamento_has_forma_pagamentoController.criarPagamentoForma);
router.get('/:pagamento_id/:forma_id', pagamento_has_forma_pagamentoController.obterPagamentoForma);
router.delete('/:pagamento_id/:forma_id', pagamento_has_forma_pagamentoController.deletarPagamentoForma);

module.exports = router;