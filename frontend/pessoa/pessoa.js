// Configuração da API, IP e porta.
const API_BASE_URL = 'http://localhost:3001';
let currentPersonCpf = null;
let operacao = null;
let cargos = [];

// Elementos do DOM
const form = document.getElementById('pessoaForm');
const searchId = document.getElementById('searchId');
const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnCancelar = document.getElementById('btnCancelar');
const btnSalvar = document.getElementById('btnSalvar');
const pessoasTableBody = document.getElementById('pessoasTableBody');
const messageContainer = document.getElementById('messageContainer');
const selectCargo = document.getElementById('select_cargo');

// Carregar lista de pessoas e cargos ao inicializar
document.addEventListener('DOMContentLoaded', () => {
    carregarCargos();
    carregarPessoas();
});

// Event Listeners
btnBuscar.addEventListener('click', buscarPessoa);
btnIncluir.addEventListener('click', incluirPessoa);
btnAlterar.addEventListener('click', alterarPessoa);
btnExcluir.addEventListener('click', excluirPessoa);
btnCancelar.addEventListener('click', cancelarOperacao);
btnSalvar.addEventListener('click', salvarOperacao);

mostrarBotoes(true, false, false, false, false, false);
bloquearCampos(false);

// Função para carregar cargos
async function carregarCargos() {
    try {
        const response = await fetch(`${API_BASE_URL}/cargo`);
        
        if (response.ok) {
            cargos = await response.json();
            preencherSelectCargos();
        } else {
            console.error('Erro ao carregar cargos');
        }
    } catch (error) {
        console.error('Erro ao carregar cargos:', error);
    }
}

// Função para preencher o select de cargos
function preencherSelectCargos() {
    selectCargo.innerHTML = '<option value="">Selecione um cargo...</option>';
    
    cargos.forEach(cargo => {
        const option = document.createElement('option');
        option.value = cargo.id_cargo;
        option.textContent = `${cargo.id_cargo} - ${cargo.nome_cargo}`;
        selectCargo.appendChild(option);
    });
}

// Função para mostrar mensagens
function mostrarMensagem(texto, tipo = 'info') {
    messageContainer.innerHTML = `<div class="message ${tipo}">${texto}</div>`;
    setTimeout(() => {
        messageContainer.innerHTML = '';
    }, 3000);
}

function bloquearCampos(bloquearPrimeiro) {
    const inputs = document.querySelectorAll('#pessoaForm input:not(#checkboxFuncionario), #pessoaForm select');
    inputs.forEach((input, index) => {
        if (index === 0) {
            input.disabled = bloquearPrimeiro;
        } else {
            input.disabled = !bloquearPrimeiro;
        }
    });
    
    // Bloqueia também os campos de funcionário
    const camposFuncionario = document.querySelectorAll('#camposFuncionario input, #camposFuncionario select');
    camposFuncionario.forEach(input => {
        input.disabled = !bloquearPrimeiro;
    });
}

// Função para limpar formulário
function limparFormulario() {
    form.reset();
    document.getElementById('select_cargo').value = '';
    document.getElementById('salario').value = '';
    document.getElementById('porcentagem_comissao').value = '';
    document.getElementById('checkboxFuncionario').checked = false;
    document.getElementById('camposFuncionario').style.display = 'none';
    currentPersonCpf = null;
}

function mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar) {
    btnBuscar.style.display = btBuscar ? 'inline-block' : 'none';
    btnIncluir.style.display = btIncluir ? 'inline-block' : 'none';
    btnAlterar.style.display = btAlterar ? 'inline-block' : 'none';
    btnExcluir.style.display = btExcluir ? 'inline-block' : 'none';
    btnSalvar.style.display = btSalvar ? 'inline-block' : 'none';
    btnCancelar.style.display = btCancelar ? 'inline-block' : 'none';
}

// Função para formatar data para exibição
function formatarData(dataString) {
    if (!dataString) return '';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
}

// Função para formatar CPF
function formatarCpf(cpf) {
    if (!cpf) return '';
    const cpfLimpo = cpf.replace(/\D/g, '');
    return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

async function funcaoEhFuncionario(pessoaCpf) {
    try {
        const response = await fetch(`${API_BASE_URL}/funcionario/${pessoaCpf}`);

        if (response.status === 404) {
            return { ehFuncionario: false };
        }

        if (response.status === 200) {
            const funcionarioData = await response.json();
            return {
                ehFuncionario: true,
                salario: funcionarioData.salario,
                cargo_id_cargo: funcionarioData.cargo_id_cargo,
                porcentagem_comissao: funcionarioData.porcentagem_comissao
            };
        }

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Erro na requisição:', errorData.error);
            return { ehFuncionario: false };
        }

    } catch (error) {
        console.error('Erro ao verificar se é funcionário:', error);
        return { ehFuncionario: false };
    }
}

// Função para buscar pessoa por CPF
async function buscarPessoa() {
    const cpf = searchId.value.trim().replace(/\D/g, '');
    if (!cpf) {
        mostrarMensagem('Digite um CPF para buscar', 'warning');
        return;
    }

    bloquearCampos(false);
    searchId.focus();
    try {
        const response = await fetch(`${API_BASE_URL}/pessoa/${cpf}`);

        if (response.ok) {
            const pessoa = await response.json();
            preencherFormulario(pessoa);

            mostrarBotoes(true, false, true, true, false, false);
            mostrarMensagem('Pessoa encontrada!', 'success');

        } else if (response.status === 404) {
            limparFormulario();
            searchId.value = cpf;
            document.getElementById('cpf_pessoa').value = cpf;
            mostrarBotoes(true, true, false, false, false, false);
            mostrarMensagem('Pessoa não encontrada. Você pode incluir uma nova pessoa.', 'info');
            bloquearCampos(false);
        } else {
            throw new Error('Erro ao buscar pessoa');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao buscar pessoa', 'error');
    }

    // Verifica se a pessoa é funcionário
    const oFuncionario = await funcaoEhFuncionario(cpf);

    if (oFuncionario.ehFuncionario) {
        document.getElementById('checkboxFuncionario').checked = true;
        document.getElementById('camposFuncionario').style.display = 'block';
        document.getElementById('salario').value = oFuncionario.salario;
        document.getElementById('select_cargo').value = oFuncionario.cargo_id_cargo;
        document.getElementById('porcentagem_comissao').value = oFuncionario.porcentagem_comissao;
    } else {
        document.getElementById('checkboxFuncionario').checked = false;
        document.getElementById('camposFuncionario').style.display = 'none';
        document.getElementById('salario').value = '';
        document.getElementById('select_cargo').value = '';
        document.getElementById('porcentagem_comissao').value = '';
    }
    
    // Atualiza o currentPersonCpf
    currentPersonCpf = cpf;
}

// Função para preencher formulário com dados da pessoa
function preencherFormulario(pessoa) {
    currentPersonCpf = pessoa.cpf_pessoa;
    searchId.value = pessoa.cpf_pessoa;
    document.getElementById('cpf_pessoa').value = pessoa.cpf_pessoa || '';
    document.getElementById('nome_pessoa').value = pessoa.nome_pessoa || '';
    document.getElementById('endereco_pessoa').value = pessoa.endereco_pessoa || '';

    // Formatação da data para input type="date"
    if (pessoa.data_nascimento_pessoa) {
        const data = new Date(pessoa.data_nascimento_pessoa);
        const dataFormatada = data.toISOString().split('T')[0];
        document.getElementById('data_nascimento_pessoa').value = dataFormatada;
    } else {
        document.getElementById('data_nascimento_pessoa').value = '';
    }
}

// Função para incluir pessoa
async function incluirPessoa() {
    mostrarMensagem('Digite os dados!', 'success');
    currentPersonCpf = searchId.value.replace(/\D/g, '');
    limparFormulario();
    searchId.value = currentPersonCpf;
    document.getElementById('cpf_pessoa').value = currentPersonCpf;
    bloquearCampos(true);

    mostrarBotoes(false, false, false, false, true, true);
    document.getElementById('nome_pessoa').focus();
    operacao = 'incluir';
}

// Função para alterar pessoa
async function alterarPessoa() {
    mostrarMensagem('Digite os dados!', 'success');
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true);
    document.getElementById('nome_pessoa').focus();
    operacao = 'alterar';
}

// Função para excluir pessoa
async function excluirPessoa() {
    if (!currentPersonCpf) {
        mostrarMensagem('Nenhuma pessoa selecionada para excluir', 'warning');
        return;
    }
    
    const confirmar = confirm(`Tem certeza que deseja excluir ${document.getElementById('nome_pessoa').value}?`);
    if (!confirmar) {
        return;
    }
    
    mostrarMensagem('Excluindo pessoa...', 'info');
    bloquearCampos(false);
    mostrarBotoes(false, false, false, false, true, true);
    operacao = 'excluir';
}

async function salvarOperacao() {
    const formData = new FormData(form);
    const pessoa = {
        cpf_pessoa: formData.get('cpf_pessoa').replace(/\D/g, ''),
        nome_pessoa: formData.get('nome_pessoa'),
        data_nascimento_pessoa: formData.get('data_nascimento_pessoa') || null,
        endereco_pessoa: formData.get('endereco_pessoa')
    };

    let funcionario = null;
    if (document.getElementById('checkboxFuncionario').checked) {
        const cargoId = document.getElementById('select_cargo').value;
        
        if (!cargoId) {
            mostrarMensagem('Selecione um cargo para o funcionário!', 'warning');
            return;
        }
        
        funcionario = {
            pessoa_cpf_pessoa: pessoa.cpf_pessoa,
            salario: parseFloat(document.getElementById('salario').value) || 0,
            cargo_id_cargo: parseInt(cargoId),
            porcentagem_comissao: parseFloat(document.getElementById('porcentagem_comissao').value) || 0
        };
    }

    let responseFuncionario = null;
    let responsePessoa = null;
    
    try {
        if (operacao === 'incluir') {
            responsePessoa = await fetch(`${API_BASE_URL}/pessoa`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pessoa)
            });

            if (document.getElementById('checkboxFuncionario').checked && responsePessoa.ok) {
                responseFuncionario = await fetch(`${API_BASE_URL}/funcionario`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(funcionario)
                });
            }

        } else if (operacao === 'alterar') {
            responsePessoa = await fetch(`${API_BASE_URL}/pessoa/${currentPersonCpf}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pessoa)
            });

            if (document.getElementById('checkboxFuncionario').checked) {
                const caminhoRota = `${API_BASE_URL}/funcionario/${currentPersonCpf}`;
                const respObterFuncionario = await fetch(caminhoRota);
                
                if (respObterFuncionario.status === 404) {
                    // Não existe, incluir
                    responseFuncionario = await fetch(`${API_BASE_URL}/funcionario`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(funcionario)
                    });
                } else {
                    // Já existe, alterar
                    responseFuncionario = await fetch(caminhoRota, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(funcionario)
                    });
                }
            } else {
                // Se deixou de ser funcionário, excluir da tabela funcionário
                const caminhoRota = `${API_BASE_URL}/funcionario/${currentPersonCpf}`;
                const respObterFuncionario = await fetch(caminhoRota);
                
                if (respObterFuncionario.status === 200) {
                    responseFuncionario = await fetch(caminhoRota, {
                        method: 'DELETE'
                    });
                }
            }
            
        } else if (operacao === 'excluir') {
            // Verificar se é funcionário, se for, excluir da tabela funcionário primeiro
            const caminhoRota = `${API_BASE_URL}/funcionario/${currentPersonCpf}`;
            const respObterFuncionario = await fetch(caminhoRota);
            
            if (respObterFuncionario.status === 200) {
                responseFuncionario = await fetch(caminhoRota, {
                    method: 'DELETE'
                });
            }
            
            // Agora exclui da tabela pessoa
            responsePessoa = await fetch(`${API_BASE_URL}/pessoa/${currentPersonCpf}`, {
                method: 'DELETE'
            });
        }

        if (responsePessoa && responsePessoa.ok && (operacao === 'incluir' || operacao === 'alterar')) {
            mostrarMensagem('Operação ' + operacao + ' realizada com sucesso!', 'success');
            limparFormulario();
            carregarPessoas();
        } else if (operacao === 'excluir' && responsePessoa && responsePessoa.ok) {
            mostrarMensagem('Pessoa excluída com sucesso!', 'success');
            limparFormulario();
            carregarPessoas();
        } else if (responsePessoa && !responsePessoa.ok) {
            const error = await responsePessoa.json();
            mostrarMensagem(error.error || 'Erro ao processar operação', 'error');
        }
        
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao processar operação', 'error');
    }

    mostrarBotoes(true, false, false, false, false, false);
    bloquearCampos(false);
    document.getElementById('searchId').focus();
}

// Função para cancelar operação
function cancelarOperacao() {
    limparFormulario();
    mostrarBotoes(true, false, false, false, false, false);
    bloquearCampos(false);
    document.getElementById('searchId').focus();
    mostrarMensagem('Operação cancelada', 'info');
}

// Função para carregar lista de pessoas
async function carregarPessoas() {
    try {
        const response = await fetch(`${API_BASE_URL}/pessoa`);

        if (response.ok) {
            const pessoas = await response.json();
            await renderizarTabelaPessoas(pessoas);
        } else {
            throw new Error('Erro ao carregar pessoas');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao carregar lista de pessoas', 'error');
    }
}

// Função para renderizar tabela de pessoas
async function renderizarTabelaPessoas(pessoas) {
    pessoasTableBody.innerHTML = '';

    for (const pessoa of pessoas) {
        const oFuncionario = await funcaoEhFuncionario(pessoa.cpf_pessoa);
        const ehFuncionario = oFuncionario.ehFuncionario ? '✅ Sim' : '❌ Não';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <button class="btn-id" onclick="selecionarPessoa('${pessoa.cpf_pessoa}')">
                    ${formatarCpf(pessoa.cpf_pessoa)}
                </button>
            </td>
            <td>${pessoa.nome_pessoa}</td>
            <td>${formatarData(pessoa.data_nascimento_pessoa)}</td>
            <td>${pessoa.endereco_pessoa || ''}</td>
            <td>${ehFuncionario}</td>
        `;
        pessoasTableBody.appendChild(row);
    }
}

// Função para selecionar pessoa da tabela
async function selecionarPessoa(cpf) {
    searchId.value = cpf;
    await buscarPessoa();
}