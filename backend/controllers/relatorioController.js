const { query } = require('../database');
const path = require('path');

exports.abrirRelatorios = (req, res) => {
  console.log('relatorioController - Rota /abrirRelatorios - abrir a página de relatórios');
  res.sendFile(path.join(__dirname, '../../frontend/relatorio/relatorio.html'));
}

// Relatório: Mês com mais vendas
exports.mesMaisVendas = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        TO_CHAR(p.data_pedido, 'YYYY-MM') as mes,
        TO_CHAR(p.data_pedido, 'TMMonth YYYY') as mes_nome,
        COUNT(DISTINCT p.id_pedido) as total_pedidos,
        COUNT(php.produto_id_produto) as total_itens,
        COALESCE(SUM(php.quantidade * php.preco_unitario), 0) as valor_total
      FROM pedido p
      LEFT JOIN pedido_has_produto php ON p.id_pedido = php.pedido_id_pedido
      GROUP BY TO_CHAR(p.data_pedido, 'YYYY-MM'), TO_CHAR(p.data_pedido, 'TMMonth YYYY')
      ORDER BY valor_total DESC, total_pedidos DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar mês com mais vendas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

// Relatório: Clientes que mais compram
exports.clientesMaisCompram = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        pes.cpf_pessoa,
        pes.nome_pessoa,
        pes.endereco_pessoa,
        COUNT(DISTINCT p.id_pedido) as total_pedidos,
        COUNT(php.produto_id_produto) as total_itens,
        COALESCE(SUM(php.quantidade * php.preco_unitario), 0) as valor_total,
        COALESCE(AVG(php.quantidade * php.preco_unitario), 0) as ticket_medio
      FROM pessoa pes
      INNER JOIN cliente c ON pes.cpf_pessoa = c.pessoa_cpf_pessoa
      LEFT JOIN pedido p ON c.pessoa_cpf_pessoa = p.cliente_pessoa_cpf_pessoa
      LEFT JOIN pedido_has_produto php ON p.id_pedido = php.pedido_id_pedido
      GROUP BY pes.cpf_pessoa, pes.nome_pessoa, pes.endereco_pessoa
      HAVING COUNT(DISTINCT p.id_pedido) > 0
      ORDER BY valor_total DESC, total_pedidos DESC
      LIMIT 20
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar clientes que mais compram:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

// Relatório: Produtos mais vendidos
exports.produtosMaisVendidos = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        prod.id_produto,
        prod.nome_produto,
        prod.preco_unitario,
        prod.quantidade_estoque,
        COUNT(DISTINCT php.pedido_id_pedido) as total_pedidos,
        SUM(php.quantidade) as quantidade_vendida,
        SUM(php.quantidade * php.preco_unitario) as valor_total_vendas
      FROM produto prod
      LEFT JOIN pedido_has_produto php ON prod.id_produto = php.produto_id_produto
      GROUP BY prod.id_produto, prod.nome_produto, prod.preco_unitario, prod.quantidade_estoque
      HAVING SUM(php.quantidade) > 0
      ORDER BY quantidade_vendida DESC, valor_total_vendas DESC
      LIMIT 20
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar produtos mais vendidos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

// Relatório: Resumo geral de vendas
exports.resumoVendas = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        COUNT(DISTINCT p.id_pedido) as total_pedidos,
        COUNT(DISTINCT p.cliente_pessoa_cpf_pessoa) as total_clientes,
        COUNT(php.produto_id_produto) as total_itens_vendidos,
        COALESCE(SUM(php.quantidade * php.preco_unitario), 0) as valor_total,
        COALESCE(AVG(php.quantidade * php.preco_unitario), 0) as ticket_medio
      FROM pedido p
      LEFT JOIN pedido_has_produto php ON p.id_pedido = php.pedido_id_pedido
    `);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar resumo de vendas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

// Relatório: Vendas por funcionário
exports.vendasPorFuncionario = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        pes.cpf_pessoa,
        pes.nome_pessoa,
        c.nome_cargo,
        COUNT(DISTINCT p.id_pedido) as total_pedidos,
        COUNT(php.produto_id_produto) as total_itens,
        COALESCE(SUM(php.quantidade * php.preco_unitario), 0) as valor_total_vendas,
        COALESCE(AVG(php.quantidade * php.preco_unitario), 0) as ticket_medio
      FROM pessoa pes
      INNER JOIN funcionario f ON pes.cpf_pessoa = f.pessoa_cpf_pessoa
      LEFT JOIN cargo c ON f.cargo_id_cargo = c.id_cargo
      LEFT JOIN pedido p ON f.pessoa_cpf_pessoa = p.funcionario_pessoa_cpf_pessoa
      LEFT JOIN pedido_has_produto php ON p.id_pedido = php.pedido_id_pedido
      GROUP BY pes.cpf_pessoa, pes.nome_pessoa, c.nome_cargo
      ORDER BY valor_total_vendas DESC, total_pedidos DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar vendas por funcionário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}