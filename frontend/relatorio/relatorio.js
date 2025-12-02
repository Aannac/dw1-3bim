// Configuração da API
const API_BASE_URL = 'http://localhost:3001';

// Elementos do DOM
const messageContainer = document.getElementById('messageContainer');

// Carregar todos os relatórios ao inicializar
document.addEventListener('DOMContentLoaded', () => {
    carregarResumoGeral();
    carregarMesMaisVendas();
    carregarClientesMaisCompram();
    carregarProdutosMaisVendidos();
    carregarVendasPorFuncionario();
});

// Função para mostrar mensagens
function mostrarMensagem(texto, tipo = 'info') {
    messageContainer.innerHTML = `<div class="message ${tipo}">${texto}</div>`;
    setTimeout(() => {
        messageContainer.innerHTML = '';
    }, 3000);
}

// Função para formatar moeda
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor || 0);
}

// Função para formatar CPF
function formatarCpf(cpf) {
    if (!cpf) return '';
    const cpfLimpo = cpf.replace(/\D/g, '');
    return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Função para obter medalha de ranking
function obterMedalha(posicao) {
    if (posicao === 1) return '<span class="ranking-medal">🥇</span>';
    if (posicao === 2) return '<span class="ranking-medal">🥈</span>';
    if (posicao === 3) return '<span class="ranking-medal">🥉</span>';
    return `<span class="ranking-medal">${posicao}º</span>`;
}

// Carregar Resumo Geral
async function carregarResumoGeral() {
    try {
        const response = await fetch(`${API_BASE_URL}/relatorio/resumo-vendas`);
        
        if (response.ok) {
            const dados = await response.json();
            
            document.getElementById('totalPedidos').textContent = dados.total_pedidos || 0;
            document.getElementById('totalClientes').textContent = dados.total_clientes || 0;
            document.getElementById('totalItens').textContent = dados.total_itens_vendidos || 0;
            document.getElementById('valorTotal').textContent = formatarMoeda(dados.valor_total);
            document.getElementById('ticketMedio').textContent = formatarMoeda(dados.ticket_medio);
            
        } else {
            throw new Error('Erro ao carregar resumo geral');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao carregar resumo geral', 'error');
    }
}

// Carregar Mês com Mais Vendas
async function carregarMesMaisVendas() {
    try {
        const response = await fetch(`${API_BASE_URL}/relatorio/mes-mais-vendas`);
        
        if (response.ok) {
            const dados = await response.json();
            const tbody = document.getElementById('tabelaMeses');
            
            if (dados.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="loading">Nenhum dado encontrado</td></tr>';
                return;
            }
            
            tbody.innerHTML = dados.map((item, index) => `
                <tr>
                    <td>${obterMedalha(index + 1)}</td>
                    <td><strong>${item.mes_nome}</strong></td>
                    <td>${item.total_pedidos || 0}</td>
                    <td>${item.total_itens || 0}</td>
                    <td class="valor-destaque">${formatarMoeda(item.valor_total)}</td>
                </tr>
            `).join('');
            
        } else {
            throw new Error('Erro ao carregar vendas por mês');
        }
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('tabelaMeses').innerHTML = 
            '<tr><td colspan="5" class="loading">Erro ao carregar dados</td></tr>';
        mostrarMensagem('Erro ao carregar vendas por mês', 'error');
    }
}

// Carregar Clientes que Mais Compram
async function carregarClientesMaisCompram() {
    try {
        const response = await fetch(`${API_BASE_URL}/relatorio/clientes-mais-compram`);
        
        if (response.ok) {
            const dados = await response.json();
            const tbody = document.getElementById('tabelaClientes');
            
            if (dados.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="loading">Nenhum dado encontrado</td></tr>';
                return;
            }
            
            tbody.innerHTML = dados.map((item, index) => `
                <tr>
                    <td>${obterMedalha(index + 1)}</td>
                    <td>${formatarCpf(item.cpf_pessoa)}</td>
                    <td><strong>${item.nome_pessoa}</strong></td>
                    <td>${item.total_pedidos || 0}</td>
                    <td>${item.total_itens || 0}</td>
                    <td class="valor-destaque">${formatarMoeda(item.valor_total)}</td>
                    <td>${formatarMoeda(item.ticket_medio)}</td>
                </tr>
            `).join('');
            
        } else {
            throw new Error('Erro ao carregar clientes');
        }
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('tabelaClientes').innerHTML = 
            '<tr><td colspan="7" class="loading">Erro ao carregar dados</td></tr>';
        mostrarMensagem('Erro ao carregar top clientes', 'error');
    }
}

// Carregar Produtos Mais Vendidos
async function carregarProdutosMaisVendidos() {
    try {
        const response = await fetch(`${API_BASE_URL}/relatorio/produtos-mais-vendidos`);
        
        if (response.ok) {
            const dados = await response.json();
            const tbody = document.getElementById('tabelaProdutos');
            
            if (dados.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" class="loading">Nenhum dado encontrado</td></tr>';
                return;
            }
            
            tbody.innerHTML = dados.map((item, index) => `
                <tr>
                    <td>${obterMedalha(index + 1)}</td>
                    <td>${item.id_produto}</td>
                    <td><strong>${item.nome_produto}</strong></td>
                    <td>${formatarMoeda(item.preco_unitario)}</td>
                    <td>${item.quantidade_estoque || 0}</td>
                    <td>${item.total_pedidos || 0}</td>
                    <td>${item.quantidade_vendida || 0}</td>
                    <td class="valor-destaque">${formatarMoeda(item.valor_total_vendas)}</td>
                </tr>
            `).join('');
            
        } else {
            throw new Error('Erro ao carregar produtos');
        }
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('tabelaProdutos').innerHTML = 
            '<tr><td colspan="8" class="loading">Erro ao carregar dados</td></tr>';
        mostrarMensagem('Erro ao carregar produtos mais vendidos', 'error');
    }
}

// Carregar Vendas por Funcionário
async function carregarVendasPorFuncionario() {
    try {
        const response = await fetch(`${API_BASE_URL}/relatorio/vendas-por-funcionario`);
        
        if (response.ok) {
            const dados = await response.json();
            const tbody = document.getElementById('tabelaFuncionarios');
            
            if (dados.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" class="loading">Nenhum dado encontrado</td></tr>';
                return;
            }
            
            tbody.innerHTML = dados.map((item, index) => `
                <tr>
                    <td>${obterMedalha(index + 1)}</td>
                    <td>${formatarCpf(item.cpf_pessoa)}</td>
                    <td><strong>${item.nome_pessoa}</strong></td>
                    <td>${item.nome_cargo || 'Sem cargo'}</td>
                    <td>${item.total_pedidos || 0}</td>
                    <td>${item.total_itens || 0}</td>
                    <td class="valor-destaque">${formatarMoeda(item.valor_total_vendas)}</td>
                    <td>${formatarMoeda(item.ticket_medio)}</td>
                </tr>
            `).join('');
            
        } else {
            throw new Error('Erro ao carregar vendas por funcionário');
        }
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('tabelaFuncionarios').innerHTML = 
            '<tr><td colspan="8" class="loading">Erro ao carregar dados</td></tr>';
        mostrarMensagem('Erro ao carregar vendas por funcionário', 'error');
    }
}