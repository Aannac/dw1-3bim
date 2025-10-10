const { query } = require('../database');

exports.listarPagamentoFormas = async (req, res) => {
  try {
    const result = await query('SELECT * FROM pagamento_has_forma_pagamento ORDER BY pagamento_id_pedido');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar pagamento formas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.criarPagamentoForma = async (req, res) => {
  try {
    const { pagamento_id_pedido, forma_pagamento_id_forma_pagamento, valor_pago } = req.body;

    const result = await query(
      'INSERT INTO pagamento_has_forma_pagamento (pagamento_id_pedido, forma_pagamento_id_forma_pagamento, valor_pago) VALUES ($1, $2, $3) RETURNING *',
      [pagamento_id_pedido, forma_pagamento_id_forma_pagamento, valor_pago]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar pagamento forma:', error);

    if (error.code === '23502') {
      return res.status(400).json({
        error: 'Dados obrigatórios não fornecidos'
      });
    }

    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Pagamento ou forma de pagamento não existe'
      });
    }

    if (error.code === '23505') {
      return res.status(400).json({
        error: 'Esta associação já existe'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.obterPagamentoForma = async (req, res) => {
  try {
    const pagamento_id = parseInt(req.params.pagamento_id);
    const forma_id = parseInt(req.params.forma_id);

    if (isNaN(pagamento_id) || isNaN(forma_id)) {
      return res.status(400).json({ error: 'IDs devem ser números válidos' });
    }

    const result = await query(
      'SELECT * FROM pagamento_has_forma_pagamento WHERE pagamento_id_pedido = $1 AND forma_pagamento_id_forma_pagamento = $2',
      [pagamento_id, forma_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Associação não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter pagamento forma:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.deletarPagamentoForma = async (req, res) => {
  try {
    const pagamento_id = parseInt(req.params.pagamento_id);
    const forma_id = parseInt(req.params.forma_id);

    const existingResult = await query(
      'SELECT * FROM pagamento_has_forma_pagamento WHERE pagamento_id_pedido = $1 AND forma_pagamento_id_forma_pagamento = $2',
      [pagamento_id, forma_id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Associação não encontrada' });
    }

    await query(
      'DELETE FROM pagamento_has_forma_pagamento WHERE pagamento_id_pedido = $1 AND forma_pagamento_id_forma_pagamento = $2',
      [pagamento_id, forma_id]
    );

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar pagamento forma:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}