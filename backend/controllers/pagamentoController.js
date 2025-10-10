const { query } = require('../database');

exports.listarPagamentos = async (req, res) => {
  try {
    const result = await query('SELECT * FROM pagamento ORDER BY pedido_id_pedido');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar pagamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.criarPagamento = async (req, res) => {
  try {
    const { pedido_id_pedido, data_pagamento, valor_total_pagamento } = req.body;

    const result = await query(
      'INSERT INTO pagamento (pedido_id_pedido, data_pagamento, valor_total_pagamento) VALUES ($1, $2, $3) RETURNING *',
      [pedido_id_pedido, data_pagamento, valor_total_pagamento]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);

    if (error.code === '23502') {
      return res.status(400).json({
        error: 'Dados obrigatórios não fornecidos'
      });
    }

    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Pedido não existe'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.obterPagamento = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    const result = await query(
      'SELECT * FROM pagamento WHERE pedido_id_pedido = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.atualizarPagamento = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { data_pagamento, valor_total_pagamento } = req.body;

    const existingResult = await query(
      'SELECT * FROM pagamento WHERE pedido_id_pedido = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    const updateResult = await query(
      'UPDATE pagamento SET data_pagamento = $1, valor_total_pagamento = $2 WHERE pedido_id_pedido = $3 RETURNING *',
      [data_pagamento, valor_total_pagamento, id]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.deletarPagamento = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const existingResult = await query(
      'SELECT * FROM pagamento WHERE pedido_id_pedido = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    await query(
      'DELETE FROM pagamento WHERE pedido_id_pedido = $1',
      [id]
    );

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar pagamento:', error);

    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Não é possível deletar pagamento com dependências associadas'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}