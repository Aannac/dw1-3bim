// Configuração da API, IP e porta.
const API_BASE_URL = 'http://localhost:3001';
let currentPersonId = null;
let operacao = null;

// Elementos do DOM
const form = document.getElementById('produtoForm');
const searchId = document.getElementById('searchId');
const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnCancelar = document.getElementById('btnCancelar');
const btnSalvar = document.getElementById('btnSalvar');
const produtosTableBody = document.getElementById('produtosTableBody');
const messageContainer = document.getElementById('messageContainer');
const imagemInput = document.getElementById('imagem');
const imagemPreview = document.getElementById('imagemPreview');

// Carregar lista de produtos ao inicializar
document.addEventListener('DOMContentLoaded', () => {
    carregarProdutos();
});

// Event Listeners
btnBuscar.addEventListener('click', buscarProduto);
btnIncluir.addEventListener('click', incluirProduto);
btnAlterar.addEventListener('click', alterarProduto);
btnExcluir.addEventListener('click', excluirProduto);
btnCancelar.addEventListener('click', cancelarOperacao);
btnSalvar.addEventListener('click', salvarOperacao);

// Event listener para preview da imagem
imagemInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagemPreview.innerHTML = `<img src="${e.target.result}" alt="Preview da imagem">`;
        };
        reader.readAsDataURL(file);
    } else {
        imagemPreview.innerHTML = '';
    }
});

mostrarBotoes(true, false, false, false, false, false); // mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
bloquearCampos(false); // libera pk e bloqueia os demais campos

// Função para mostrar mensagens
function mostrarMensagem(texto, tipo = 'info') {
    messageContainer.innerHTML = `<div class="message ${tipo}">${texto}</div>`;
    setTimeout(() => {
        messageContainer.innerHTML = '';
    }, 3000);
}

function bloquearCampos(bloquearPrimeiro) {
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach((input, index) => {
        if (index === 0) {
            // Primeiro elemento - bloqueia se bloquearPrimeiro for true, libera se for false
            input.disabled = bloquearPrimeiro;
        } else {
            // Demais elementos - faz o oposto do primeiro
            input.disabled = !bloquearPrimeiro;
        }
    });
}

// Função para limpar formulário
function limparFormulario() {
    form.reset();
    currentPersonId = null;
    imagemPreview.innerHTML = '';
}

function mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar) {
    btnBuscar.style.display = btBuscar ? 'inline-block' : 'none';
    btnIncluir.style.display = btIncluir ? 'inline-block' : 'none';
    btnAlterar.style.display = btAlterar ? 'inline-block' : 'none';
    btnExcluir.style.display = btExcluir ? 'inline-block' : 'none';
    btnSalvar.style.display = btSalvar ? 'inline-block' : 'none';
    btnCancelar.style.display = btCancelar ? 'inline-block' : 'none';
}

// Função para buscar produto por ID
async function buscarProduto() {
    const id = searchId.value.trim();
    if (!id) {
        mostrarMensagem('Digite um ID para buscar', 'warning');
        return;
    }
    bloquearCampos(false);
    // focus no campo searchId
    searchId.focus();
    
    try {
        const response = await fetch(`${API_BASE_URL}/produto/${id}`);
        console.log(JSON.stringify(response));

        if (response.ok) {
            const produto = await response.json();
            preencherFormulario(produto);

            mostrarBotoes(true, false, true, true, false, false); // mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
            mostrarMensagem('Produto encontrado!', 'success');

        } else if (response.status === 404) {
            limparFormulario();
            searchId.value = id;
            mostrarBotoes(true, true, false, false, false, false); // mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
            mostrarMensagem('Produto não encontrado. Você pode incluir um novo produto.', 'info');
            bloquearCampos(false); // bloqueia a pk e libera os demais campos
            // enviar o foco para o campo de nome
        } else {
            throw new Error('Erro ao buscar produto');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao buscar produto', 'error');
    }
}

// Função para preencher formulário com dados do produto
function preencherFormulario(produto) {
    console.log(JSON.stringify(produto));

    currentPersonId = produto.id_produto;
    searchId.value = produto.id_produto;
    document.getElementById('nome_produto').value = produto.nome_produto || '';
    document.getElementById('quantidade_estoque').value = produto.quantidade_estoque || 0;
    document.getElementById('preco_unitario').value = produto.preco_unitario || 0;
    
    // ✅ CORRIGIDO: Campo correto é imagem_produto (não imagem_path)
    if (produto.imagem_produto) {
        imagemPreview.innerHTML = `<img src="${produto.imagem_produto}" alt="Imagem do produto">`;
    } else {
        imagemPreview.innerHTML = '';
    }
}

async function incluirProduto() {
    mostrarMensagem('Digite os dados!', 'success');
    currentPersonId = searchId.value;
    limparFormulario();
    // mantém o ID buscado
    searchId.value = currentPersonId;
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true); 
    // foca no primeiro campo (nome do produto)
    document.getElementById('nome_produto').focus();
    // garante que preco e quantidade_estoque começam limpos
    document.getElementById('preco_unitario').value = '';
    document.getElementById('quantidade_estoque').value = '';
    operacao = 'incluir';
}

// Função para alterar produto
async function alterarProduto() {
    mostrarMensagem('Digite os dados!', 'success');
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true); 
    // foca no primeiro campo editável
    document.getElementById('nome_produto').focus();
    // garante que os campos de preço e estoque estão liberados
    document.getElementById('preco_unitario').disabled = false;
    document.getElementById('quantidade_estoque').disabled = false;
    operacao = 'alterar';
}

// ✅ CORRIGIDA: Função para excluir produto
async function excluirProduto() {
    // Verifica se há um produto selecionado
    if (!currentPersonId) {
        mostrarMensagem('Nenhum produto selecionado para exclusão', 'warning');
        return;
    }

    // Confirma a exclusão
    if (!confirm(`Tem certeza que deseja excluir o produto ${currentPersonId}?`)) {
        return;
    }

    try {
        mostrarMensagem('Excluindo produto...', 'info');
        
        // ✅ CORRIGIDO: Rota alterada de /produtos/ para /produto/
        const response = await fetch(`${API_BASE_URL}/produto/${currentPersonId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            mostrarMensagem('Produto excluído com sucesso!', 'success');
            limparFormulario();
            carregarProdutos();
            mostrarBotoes(true, false, false, false, false, false);
            bloquearCampos(false);
            searchId.focus();
        } else if (response.status === 404) {
            mostrarMensagem('Produto não encontrado', 'warning');
        } else if (response.status === 400) {
            const errorData = await response.json();
            mostrarMensagem(errorData.error || 'Erro ao excluir produto', 'error');
        } else {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        mostrarMensagem('Erro de conexão ao excluir produto', 'error');
    }
}

// ✅ CORRIGIDA: Função para salvar operação
async function salvarOperacao() {
    console.log('Operação:', operacao + ' - currentPersonId: ' + currentPersonId + ' - searchId: ' + searchId.value);

    // ✅ CORRIGIDO: Usar FormData para enviar arquivos
    const formData = new FormData(form);
    
    let response = null;
    try {
        if (operacao === 'incluir') {
            // ✅ Envia FormData (não JSON) para suportar upload de arquivo
            response = await fetch(`${API_BASE_URL}/produto`, {
                method: 'POST',
                body: formData // Remove headers - o navegador define automaticamente com boundary
            });
        } else if (operacao === 'alterar') {
            // ✅ Envia FormData (não JSON) para suportar upload de arquivo
            response = await fetch(`${API_BASE_URL}/produto/${currentPersonId}`, {
                method: 'PUT',
                body: formData // Remove headers - o navegador define automaticamente com boundary
            });
        }
        
        if (response.ok && (operacao === 'incluir' || operacao === 'alterar')) {
            const novaProduto = await response.json();
            mostrarMensagem('Operação ' + operacao + ' realizada com sucesso!', 'success');
            limparFormulario();
            carregarProdutos();

        } else if (operacao !== 'excluir') {
            const error = await response.json();
            mostrarMensagem(error.error || 'Erro ao salvar produto', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao incluir ou alterar o produto', 'error');
    }

    mostrarBotoes(true, false, false, false, false, false); // mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
    bloquearCampos(false); // libera pk e bloqueia os demais campos
    document.getElementById('searchId').focus();
}

// Função para cancelar operação
function cancelarOperacao() {
    limparFormulario();
    mostrarBotoes(true, false, false, false, false, false); // mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
    bloquearCampos(false); // libera pk e bloqueia os demais campos
    document.getElementById('searchId').focus();
    mostrarMensagem('Operação cancelada', 'info');
}

// Função para carregar lista de produtos
async function carregarProdutos() {
    try {
        const rota = `${API_BASE_URL}/produto`;
        // console.log("a rota " + rota);

        const response = await fetch(rota);
        // console.log(JSON.stringify(response));

        // debugger
        if (response.ok) {
            const produtos = await response.json();
            renderizarTabelaProdutos(produtos);
        } else {
            throw new Error('Erro ao carregar produtos');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao carregar lista de produtos', 'error');
    }
}

// Função para renderizar tabela de produtos
function renderizarTabelaProdutos(produtos) {
    produtosTableBody.innerHTML = '';

    produtos.forEach(produto => {
        const row = document.createElement('tr');
        const imagemHtml = produto.imagem_produto 
            ? `<img src="${produto.imagem_produto}" alt="Imagem do produto" class="table-image" style="width: 50px; height: 50px; object-fit: cover;">`
            : 'Sem imagem';
        
        row.innerHTML = `
            <td>
                <button class="btn-id" onclick="selecionarProduto(${produto.id_produto})">
                    ${produto.id_produto}
                </button>
            </td>
            <td>${produto.nome_produto}</td>                  
            <td>${produto.quantidade_estoque}</td>                  
            <td>R$ ${Number(produto.preco_unitario).toFixed(2)}</td>
            <td>${imagemHtml}</td>        
        `;
        produtosTableBody.appendChild(row);
    });
}

// Função para selecionar produto da tabela
async function selecionarProduto(id) {
    searchId.value = id;
    await buscarProduto();
}