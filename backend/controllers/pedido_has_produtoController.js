//import { query } from '../database.js';
const { query } = require('../database');
// Funções do controller

const path = require('path');

exports.abrirCrudPedido_has_produto = (req, res) => {
  console.log('pedido_has_produtoController - Rota /abrirCrudPedido_has_produto - abrir o crudPedido_has_produto');
  res.sendFile(path.join(__dirname, '../../frontend/pedido_has_produto/pedido_has_produto.html'));
}

exports.listarPedido_has_produtos = async (req, res) => {
  try {
    const result = await query('SELECT * FROM pedido_has_produto ORDER BY pedido_id_pedido');
    console.log('Resultado do SELECT:', result.rows);//verifica se está retornando algo
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar pedido_has_produtos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}


exports.criarPedido_has_produto = async (req, res) => {
  //  console.log('Criando pedido_has_produto com dados:', req.body);
  try {
    const { pedido_id_pedido, produto_id_produto, quantidade, preco_unitario } = req.body;


    const result = await query(
      'INSERT INTO pedido_has_produto (pedido_id_pedido, produto_id_produto, quantidade, preco_unitario) VALUES ($1, $2, $3,$4) RETURNING *',
      [pedido_id_pedido, produto_id_produto, quantidade, preco_unitario]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar pedido_has_produto:', error);



    // Verifica se é erro de violação de constraint NOT NULL
    if (error.code === '23502') {
      return res.status(400).json({
        error: 'Dados obrigatórios não fornecidos'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.obterPedido_has_produto = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // console.log("estou no obter pedido_has_produto id="+ id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    const result = await query(
      'SELECT * FROM pedido_has_produto WHERE pedido_id_pedido = $1',
      [id]
    );

    //console.log(result)

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido_has_produto não encontrado' });
    }

    res.json(result.rows); //retorna todos os itens do pedido
  } catch (error) {
    console.error('Erro ao obter pedido_has_produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.atualizarPedido_has_produto = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nome_pedido_has_produto } = req.body;


    // Verifica se a pedido_has_produto existe
    const existingPersonResult = await query(
      'SELECT * FROM pedido_has_produto WHERE id_pedido_has_produto = $1',
      [id]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido_has_produto não encontrada' });
    }

    // Constrói a query de atualização dinamicamente para campos não nulos
    const currentPerson = existingPersonResult.rows[0];
    const updatedFields = {
      nome_pedido_has_produto: nome_pedido_has_produto !== undefined ? nome_pedido_has_produto : currentPerson.nome_pedido_has_produto
    };

    // Atualiza a pedido_has_produto
    const updateResult = await query(
      'UPDATE pedido_has_produto SET nome_pedido_has_produto = $1 WHERE id_pedido_has_produto = $2 RETURNING *',
      [updatedFields.nome_pedido_has_produto, id]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar pedido_has_produto:', error);


    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.deletarPedido_has_produto = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    // Verifica se a pedido_has_produto existe
    const existingPersonResult = await query(
      'SELECT * FROM pedido_has_produto WHERE id_pedido_has_produto = $1',
      [id]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido_has_produto não encontrada' });
    }

    // Deleta a pedido_has_produto (as constraints CASCADE cuidarão das dependências)
    await query(
      'DELETE FROM pedido_has_produto WHERE id_pedido_has_produto = $1',
      [id]
    );

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar pedido_has_produto:', error);

    // Verifica se é erro de violação de foreign key (dependências)
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Não é possível deletar pedido_has_produto com dependências associadas'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}


