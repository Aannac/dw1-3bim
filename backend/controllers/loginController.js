const { query } = require('../database');
const path = require('path');

exports.abrirLogin = (req, res) => {
  console.log('loginController - Rota /login/abrirLogin - abrir a página de login');
  
  // Caminho correto para o arquivo login.html
  const caminhoLogin = path.join(__dirname, '../../frontend/login/login.html');
  console.log('Tentando abrir arquivo:', caminhoLogin);
  
  res.sendFile(caminhoLogin, (err) => {
    if (err) {
      console.error('Erro ao enviar arquivo login.html:', err);
      res.status(500).json({
        error: 'Erro ao carregar página de login',
        details: err.message
      });
    }
  });
}

exports.verificarLogin = async (req, res) => {
  try {
    const { cpf_pessoa, senha_pessoa } = req.body;

    console.log('Tentativa de login:', { cpf_pessoa, senha_fornecida: senha_pessoa ? '***' : 'não fornecida' });

    if (!cpf_pessoa || !senha_pessoa) {
      return res.status(400).json({
        error: 'CPF e senha são obrigatórios'
      });
    }

    // Limpar CPF (remover formatação)
    const cpfLimpo = cpf_pessoa.replace(/\D/g, '');

    // Buscar pessoa pelo CPF (incluindo senha para comparação)
    const result = await query(
      'SELECT * FROM pessoa WHERE cpf_pessoa = $1',
      [cpfLimpo]
    );

    if (result.rows.length === 0) {
      console.log('Usuário não encontrado:', cpfLimpo);
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    const pessoa = result.rows[0];

    // Verificar senha (em produção, usar bcrypt)
    if (pessoa.senha_pessoa !== senha_pessoa) {
      console.log('Senha incorreta para:', cpfLimpo);
      return res.status(401).json({
        error: 'Senha incorreta'
      });
    }

    console.log('Login bem-sucedido:', cpfLimpo);

    // Verificar se é funcionário
    const funcionarioResult = await query(
      'SELECT * FROM funcionario WHERE pessoa_cpf_pessoa = $1',
      [cpfLimpo]
    );

    const isFuncionario = funcionarioResult.rows.length > 0;

    // Retornar dados do usuário (sem a senha)
    res.json({
      cpf: pessoa.cpf_pessoa,
      nome: pessoa.nome_pessoa,
      data_nascimento: pessoa.data_nascimento_pessoa,
      endereco: pessoa.endereco_pessoa,
      isFuncionario: isFuncionario,
      funcionarioData: isFuncionario ? funcionarioResult.rows[0] : null
    });

  } catch (error) {
    console.error('Erro ao verificar login:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
}

exports.logout = async (req, res) => {
  try {
    // Implementar lógica de logout se necessário
    // (limpar cookies, sessões, etc.)
    console.log('Logout realizado');
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}