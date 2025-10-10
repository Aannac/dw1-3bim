const { query } = require('../database');
const path = require('path');

exports.abrirCrudPessoa = (req, res) => {
  console.log('pessoaController - Rota /abrirCrudPessoa - abrir o crudPessoa');
  res.sendFile(path.join(__dirname, '../../frontend/pessoa/pessoa.html'));
}

exports.listarPessoas = async (req, res) => {
  try {
    const result = await query('SELECT * FROM pessoa ORDER BY cpf_pessoa');
    console.log('Resultado do SELECT:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar pessoas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.criarPessoa = async (req, res) => {
  console.log('Criando pessoa com dados:', req.body);
  try {
    const { cpf_pessoa, nome_pessoa, data_nascimento_pessoa, endereco_pessoa } = req.body;

    // ValidaÃ§Ã£o bÃ¡sica
    if (!cpf_pessoa || !nome_pessoa) {
      return res.status(400).json({
        error: 'CPF e nome sÃ£o obrigatÃ³rios'
      });
    }

    // ValidaÃ§Ã£o de CPF bÃ¡sica (apenas formato)
    const cpfRegex = /^\d{11}$/;
    if (!cpfRegex.test(cpf_pessoa.replace(/\D/g, ''))) {
      return res.status(400).json({
        error: 'CPF deve conter 11 dÃ­gitos'
      });
    }

    const result = await query(
      'INSERT INTO pessoa (cpf_pessoa, nome_pessoa, data_nascimento_pessoa, endereco_pessoa) VALUES ($1, $2, $3, $4) RETURNING *',
      [cpf_pessoa, nome_pessoa, data_nascimento_pessoa, endereco_pessoa]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar pessoa:', error);

    // Verifica se Ã© erro de CPF duplicado (constraint unique violation)
    if (error.code === '23505') {
      return res.status(400).json({
        error: 'CPF jÃ¡ estÃ¡ cadastrado'
      });
    }

    // Verifica se Ã© erro de violaÃ§Ã£o de constraint NOT NULL
    if (error.code === '23502') {
      return res.status(400).json({
        error: 'Dados obrigatÃ³rios nÃ£o fornecidos'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.obterPessoa = async (req, res) => {
  try {
    const cpf = req.params.id; // Usando CPF como identificador

    if (!cpf) {
      return res.status(400).json({ error: 'CPF deve ser fornecido' });
    }

    const result = await query(
      'SELECT * FROM pessoa WHERE cpf_pessoa = $1',
      [cpf]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa nÃ£o encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter pessoa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.atualizarPessoa = async (req, res) => {
  try {
    const cpf = req.params.id; // Usando CPF como identificador
    const { nome_pessoa, data_nascimento_pessoa, endereco_pessoa } = req.body;

    // Verifica se a pessoa existe
    const existingPersonResult = await query(
      'SELECT * FROM pessoa WHERE cpf_pessoa = $1',
      [cpf]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa nÃ£o encontrada' });
    }

    // ConstrÃ³i a query de atualizaÃ§Ã£o dinamicamente para campos nÃ£o nulos
    const currentPerson = existingPersonResult.rows[0];
    const updatedFields = {
      nome_pessoa: nome_pessoa !== undefined ? nome_pessoa : currentPerson.nome_pessoa,
      data_nascimento_pessoa: data_nascimento_pessoa !== undefined ? data_nascimento_pessoa : currentPerson.data_nascimento_pessoa,
      endereco_pessoa: endereco_pessoa !== undefined ? endereco_pessoa : currentPerson.endereco_pessoa
    };

    // Atualiza a pessoa
    const updateResult = await query(
      'UPDATE pessoa SET nome_pessoa = $1, data_nascimento_pessoa = $2, endereco_pessoa = $3 WHERE cpf_pessoa = $4 RETURNING *',
      [updatedFields.nome_pessoa, updatedFields.data_nascimento_pessoa, updatedFields.endereco_pessoa, cpf]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar pessoa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.deletarPessoa = async (req, res) => {
  try {
    const cpf = req.params.id; // Usando CPF como identificador
    
    // Verifica se a pessoa existe
    const existingPersonResult = await query(
      'SELECT * FROM pessoa WHERE cpf_pessoa = $1',
      [cpf]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa nÃ£o encontrada' });
    }

    // Deleta a pessoa (as constraints CASCADE cuidarÃ£o das dependÃªncias)
    await query(
      'DELETE FROM pessoa WHERE cpf_pessoa = $1',
      [cpf]
    );

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar pessoa:', error);

    // Verifica se Ã© erro de violaÃ§Ã£o de foreign key (dependÃªncias)
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'NÃ£o Ã© possÃ­vel deletar pessoa com dependÃªncias associadas (funcionÃ¡rio ou cliente)'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

// FunÃ§Ã£o adicional para buscar pessoa por CPF
exports.obterPessoaPorCpf = async (req, res) => {
  try {
    const { cpf } = req.params;

    if (!cpf) {
      return res.status(400).json({ error: 'CPF Ã© obrigatÃ³rio' });
    }

    const result = await query(
      'SELECT * FROM pessoa WHERE cpf_pessoa = $1',
      [cpf]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa nÃ£o encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter pessoa por CPF:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
