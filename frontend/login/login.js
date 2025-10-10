// Configuração da API
const API_BASE_URL = 'http://localhost:3001';

// Elementos do DOM
const loginForm = document.getElementById('loginForm');
const cadastroForm = document.getElementById('cadastroForm');
const linkCadastro = document.getElementById('linkCadastro');
const btnVoltar = document.getElementById('btnVoltar');
const mensagem = document.getElementById('mensagem');

// Máscara de CPF
function mascaraCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
  cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
  cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  return cpf;
}

// Aplicar máscara nos campos de CPF
document.getElementById('cpf').addEventListener('input', (e) => {
  e.target.value = mascaraCPF(e.target.value);
});

document.getElementById('cadastroCpf').addEventListener('input', (e) => {
  e.target.value = mascaraCPF(e.target.value);
});

// Alternar entre login e cadastro
linkCadastro.addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.style.display = 'none';
  cadastroForm.style.display = 'block';
  limparMensagem();
});

btnVoltar.addEventListener('click', () => {
  cadastroForm.style.display = 'none';
  loginForm.style.display = 'block';
  limparMensagem();
});

// Função para exibir mensagens
function exibirMensagem(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = `mensagem ${tipo}`;
  
  if (tipo === 'sucesso') {
    setTimeout(() => {
      limparMensagem();
    }, 3000);
  }
}

function limparMensagem() {
  mensagem.textContent = '';
  mensagem.className = 'mensagem';
}

// Validar CPF
function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  
  if (cpf.length !== 11) {
    return false;
  }
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }
  
  return true;
}

// Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  limparMensagem();

  const cpf = document.getElementById('cpf').value.replace(/\D/g, '');
  const senha = document.getElementById('senha').value;

  if (!validarCPF(cpf)) {
    exibirMensagem('CPF inválido!', 'erro');
    return;
  }

  if (!senha) {
    exibirMensagem('Por favor, digite sua senha!', 'erro');
    return;
  }

  try {
    exibirMensagem('Verificando credenciais...', 'info');

    // Usar a rota de verificação de login
    const response = await fetch(`${API_BASE_URL}/login/verificar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cpf_pessoa: cpf,
        senha_pessoa: senha
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      exibirMensagem(errorData.error || 'Erro ao fazer login', 'erro');
      return;
    }

    const userData = await response.json();

    // Login bem-sucedido
    exibirMensagem('Login realizado com sucesso! 🎉', 'sucesso');
    
    // Salvar dados do usuário no sessionStorage
    sessionStorage.setItem('usuarioLogado', JSON.stringify({
      cpf: userData.cpf,
      nome: userData.nome,
      dataLogin: new Date().toISOString()
    }));

    // Salvar se é funcionário
    sessionStorage.setItem('isFuncionario', userData.isFuncionario);

    // Redirecionar para a página principal
    setTimeout(() => {
      window.location.href = '/menu/abrirMenuPrincipal';
    }, 1500);

  } catch (error) {
    console.error('Erro no login:', error);
    exibirMensagem('Erro ao fazer login. Tente novamente!', 'erro');
  }
});

// Cadastro
cadastroForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  limparMensagem();

  const cpf = document.getElementById('cadastroCpf').value.replace(/\D/g, '');
  const nome = document.getElementById('cadastroNome').value.trim();
  const dataNascimento = document.getElementById('cadastroDataNascimento').value;
  const endereco = document.getElementById('cadastroEndereco').value.trim();
  const senha = document.getElementById('cadastroSenha').value;
  const confirmarSenha = document.getElementById('cadastroConfirmarSenha').value;

  // Validações
  if (!validarCPF(cpf)) {
    exibirMensagem('CPF inválido!', 'erro');
    return;
  }

  if (nome.length < 3) {
    exibirMensagem('Nome deve ter pelo menos 3 caracteres!', 'erro');
    return;
  }

  if (!dataNascimento) {
    exibirMensagem('Data de nascimento é obrigatória!', 'erro');
    return;
  }

  // Validar idade (deve ter pelo menos 13 anos)
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  const idade = hoje.getFullYear() - nascimento.getFullYear();
  
  if (idade < 13) {
    exibirMensagem('Você deve ter pelo menos 13 anos para se cadastrar!', 'erro');
    return;
  }

  if (endereco.length < 5) {
    exibirMensagem('Endereço deve ter pelo menos 5 caracteres!', 'erro');
    return;
  }

  if (senha.length < 6) {
    exibirMensagem('Senha deve ter pelo menos 6 caracteres!', 'erro');
    return;
  }

  if (senha !== confirmarSenha) {
    exibirMensagem('As senhas não coincidem!', 'erro');
    return;
  }

  try {
    exibirMensagem('Cadastrando...', 'info');

    // Criar pessoa
    const response = await fetch(`${API_BASE_URL}/pessoa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cpf_pessoa: cpf,
        nome_pessoa: nome,
        data_nascimento_pessoa: dataNascimento,
        endereco_pessoa: endereco,
        senha_pessoa: senha
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      if (errorData.error && errorData.error.includes('já está cadastrado')) {
        exibirMensagem('CPF já cadastrado! Faça login.', 'erro');
      } else {
        exibirMensagem(errorData.error || 'Erro ao cadastrar!', 'erro');
      }
      return;
    }

    const novaPessoa = await response.json();
    
    exibirMensagem('Cadastro realizado com sucesso! 🎉', 'sucesso');
    
    // Limpar formulário
    cadastroForm.reset();
    
    // Voltar para o login após 2 segundos
    setTimeout(() => {
      cadastroForm.style.display = 'none';
      loginForm.style.display = 'block';
      limparMensagem();
      exibirMensagem('Agora você pode fazer login! 💕', 'info');
    }, 2000);

  } catch (error) {
    console.error('Erro no cadastro:', error);
    exibirMensagem('Erro ao cadastrar. Tente novamente!', 'erro');
  }
});