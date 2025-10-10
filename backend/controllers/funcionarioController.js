const { query } = require('../database');

exports.listarFuncionarios = async (req, res) => {
  try {
    const result = await query('SELECT * FROM funcionario ORDER BY pessoa_cpf_pessoa');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar funcionários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.criarFuncionario = async (req, res) => {
  console.log('Criando funcionário com dados:', req.body);
  try {
    const { pessoa_cpf_pessoa, salario, cargo_id_cargo, porcentagem_comissao } = req.body;

    if (!pessoa_cpf_pessoa) {
      return res.status(400).json({
        error: 'CPF da pessoa é obrigatório'
      });
    }

    const pessoaExiste = await query(
      'SELECT * FROM pessoa WHERE cpf_pessoa = $1',
      [pessoa_cpf_pessoa]
    );

    if (pessoaExiste.rows.length === 0) {
      return res.status(400).json({
        error: 'Pessoa não encontrada. Cadastre a pessoa primeiro.'
      });
    }

    const funcionarioExiste = await query(
      'SELECT * FROM funcionario WHERE pessoa_cpf_pessoa = $1',
      [pessoa_cpf_pessoa]
    );

    if (funcionarioExiste.rows.length > 0) {
      return res.status(400).json({
        error: 'Esta pessoa já é um funcionário'
      });
    }

    const result = await query(
      'INSERT INTO funcionario (pessoa_cpf_pessoa, salario, cargo_id_cargo, porcentagem_comissao) VALUES ($1, $2, $3, $4) RETURNING *',
      [pessoa_cpf_pessoa, salario || 0, cargo_id_cargo, porcentagem_comissao || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar funcionário:', error);

    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Cargo não encontrado ou CPF inválido'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.obterFuncionario = async (req, res) => {
  try {
    const cpf = req.params.cpf;

    if (!cpf) {
      return res.status(400).json({ error: 'CPF deve ser fornecido' });
    }

    const result = await query(
      'SELECT * FROM funcionario WHERE pessoa_cpf_pessoa = $1',
      [cpf]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter funcionário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.atualizarFuncionario = async (req, res) => {
  try {
    const cpf = req.params.cpf;
    const { salario, cargo_id_cargo, porcentagem_comissao } = req.body;

    const existingFuncionario = await query(
      'SELECT * FROM funcionario WHERE pessoa_cpf_pessoa = $1',
      [cpf]
    );

    if (existingFuncionario.rows.length === 0) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    const currentFuncionario = existingFuncionario.rows[0];
    const updatedFields = {
      salario: salario !== undefined ? salario : currentFuncionario.salario,
      cargo_id_cargo: cargo_id_cargo !== undefined ? cargo_id_cargo : currentFuncionario.cargo_id_cargo,
      porcentagem_comissao: porcentagem_comissao !== undefined ? porcentagem_comissao : currentFuncionario.porcentagem_comissao
    };

    const updateResult = await query(
      'UPDATE funcionario SET salario = $1, cargo_id_cargo = $2, porcentagem_comissao = $3 WHERE pessoa_cpf_pessoa = $4 RETURNING *',
      [updatedFields.salario, updatedFields.cargo_id_cargo, updatedFields.porcentagem_comissao, cpf]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error);
    
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Cargo não encontrado'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.deletarFuncionario = async (req, res) => {
  try {
    const cpf = req.params.cpf;
    
    const existingFuncionario = await query(
      'SELECT * FROM funcionario WHERE pessoa_cpf_pessoa = $1',
      [cpf]
    );

    if (existingFuncionario.rows.length === 0) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    await query(
      'DELETE FROM funcionario WHERE pessoa_cpf_pessoa = $1',
      [cpf]
    );

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar funcionário:', error);

    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Não é possível deletar funcionário com dependências associadas'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}