// Configuração da API
const API_BASE_URL = 'http://localhost:3001';

// Elementos do DOM
const messageContainer = document.getElementById('messageContainer');

// Função para voltar ao menu
function voltarMenu() {
    window.location.href = '../menu.html';
}

// Função para imprimir seção específica
function imprimirTudo() {
    const mainContent = document.querySelector('main').innerHTML;
    const tituloRelatorio = document.querySelector('header h1').textContent;

    const conteudoImpressao = `
        <html>
        <head>
            <title>${tituloRelatorio} - Plushies</title>
            <style>
                @page {
                    size: A4 landscape; /* Usar paisagem para o relatório completo */
                    margin: 1.5cm;
                }
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body { 
                    font-family: Arial, sans-serif; 
                    padding: 15px;
                    width: 100%;
                    color: #000;
                }
                
                h1 { 
                    color: #d4507a; 
                    border-bottom: 2px solid #ffc1d4; 
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                    font-size: 2.5em;
                    text-align: center;
                }
                
                h2 {
                    color: #d4507a;
                    font-size: 2.2em;
                    margin-bottom: 15px;
                    page-break-after: avoid;
                }

                section {
                    margin-bottom: 20px;
                    padding: 15px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    page-break-inside: avoid; /* Evita quebra de página dentro da seção */
                    page-break-before: auto;
                }

                .relatorio-section {
                    page-break-before: always; /* Força quebra de página antes de cada seção de relatório */
                }
                .resumo-section {
                    page-break-before: auto;
                }

                .section-header {
                    border-bottom: 2px solid #ffc1d4;
                    padding-bottom: 5px;
                    margin-bottom: 10px;
                }
                
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 10px;
                    table-layout: auto;
                    font-size: 1.4em; /* Aumentado para melhor visualização */
                    page-break-inside: avoid;
                }
                
                th, td { 
                    border: 1px solid #ddd; 
                    padding: 8px 10px;
                    text-align: left;
                    word-wrap: break-word;
                    
                }
                
                th { 
                    background-color: #ff9eb7; 
                    color: white;
                    font-weight: bold;
                    font-size: 1.4em;
                }
                
                tr:nth-child(even) { 
                    background-color: #f9f9f9; 
                }
                tr {
                    page-break-inside: avoid;
                }
                tr {
                    page-break-inside: avoid;
                }
                
                .valor-destaque {
                    color: #d4507a;
                    font-weight: bold;
                }
                
                .ranking-medal {
                    font-size: 2em;
                }
                
                .print-date { 
                    text-align: right; 
                    color: #666; 
                    font-size: 0.9em; 
                    margin-top: 20px;
                    padding-top: 10px;
                    border-top: 1px solid #ddd;
                }
                
                .cards-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr); /* Voltando para 4 colunas no paisagem */
                    gap: 15px;
                    margin-top: 15px;
                }
                
                .card-resumo {
                    border: 2px solid #ffc1d4;
                    padding: 15px;
                    border-radius: 10px;
                    background: #fff5f7;
                    text-align: center;
                    page-break-inside: avoid;
                }
                
                .card-icon {
                    font-size: 2.5em;
                    margin-bottom: 10px;
                }
                
                .card-label {
                    font-size: 1.4em;
                    color: #666;
                    font-weight: 600;
                }
                
                .card-value {
                    font-size: 2.2em;
                    font-weight: bold;
                    color: #d4507a;
                }

                /* Forçar a renderização de cores */
                @media print {
                    * {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            </style>
        </head>
        <body>
            <h1>${tituloRelatorio}</h1>
            ${mainContent}
            <div class="print-date">Impresso em: ${new Date().toLocaleString('pt-BR')}</div>
        </body>
        </html>
    `;

    // Criar nova janela e imprimir
    const janelaImpressao = window.open('', '_blank', 'width=1200,height=800');
    janelaImpressao.document.write(conteudoImpressao);
    janelaImpressao.document.close();
    janelaImpressao.focus();
    
    setTimeout(() => {
        janelaImpressao.print();
    }, 500);
}

function imprimirSecao(secaoId) {
    const secao = document.getElementById(secaoId);
    if (!secao) {
        mostrarMensagem('Seção não encontrada', 'error');
        return;
    }

    const sectionElement = secao.closest('section');
    const tituloSecao = sectionElement.querySelector('h2').textContent;
    const conteudoSecao = secao.innerHTML;
    
    // Criar conteúdo para impressão com largura ajustada
    const conteudoImpressao = `
        <html>
        <head>
            <title>${tituloSecao} - Plushies</title>
            <style>
                @page {
                    size: A4 landscape;
                    margin: 1cm;
                }
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body { 
                    font-family: Arial, sans-serif; 
                    padding: 15px;
                    width: 100%;
                }
                
                h1 { 
                    color: #d4507a; 
                    border-bottom: 2px solid #ffc1d4; 
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                    font-size: 2.2em;
                }
                
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 10px;
                    table-layout: auto; page-break-inside: avoid;
                    font-size: 2.2em;
                }
                
                th, td { 
                    border: 1px solid #ddd; 
                    padding: 8px 10px;
                    text-align: left;
                    word-wrap: break-word;
                }
                
                th { 
                    background-color: #ff9eb7; 
                    color: white;
                    font-weight: bold;
                    font-size: 0.9em;
                }
                
                tr:nth-child(even) { 
                    background-color: #f9f9f9; 
                }
                tr {
                    page-break-inside: avoid;
                }
                tr {
                    page-break-inside: avoid;
                }
                
                .valor-destaque {
                    color: #d4507a;
                    font-weight: bold;
                }
                
                .ranking-medal {
                    font-size: 1.4em;
                }
                
                .print-date { 
                    text-align: right; 
                    color: #666; 
                   font-size: 1.4em; 
                    margin-top: 15px;
                    padding-top: 10px;
                    border-top: 1px solid #ddd;
                }
                
                .cards-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    margin-top: 15px;
                }
                
                .card-resumo {
                    border: 2px solid #ffc1d4;
                    padding: 12px;
                    border-radius: 8px;
                    background: #fff5f7;
                    text-align: center;
                }
                
                .card-icon {
                    font-size: 2.5em;
                    margin-bottom: 8px;
                }
                
                .card-info {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                
                .card-label {
                    font-size: 0.8em;
                    color: #666;
                    font-weight: 600;
                }
                
                .card-value {
                    font-size: 2.2em;
                    font-weight: bold;
                    color: #d4507a;
                }
                
                @media print {
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            </style>
        </head>
        <body>
            <h1>${tituloSecao}</h1>
            ${conteudoSecao}
            <div class="print-date">Impresso em: ${new Date().toLocaleString('pt-BR')}</div>
        </body>
        </html>
    `;

    // Criar nova janela e imprimir
    const janelaImpressao = window.open('', '_blank', 'width=1200,height=800');
    janelaImpressao.document.write(conteudoImpressao);
    janelaImpressao.document.close();
    janelaImpressao.focus();
    
    setTimeout(() => {
        janelaImpressao.print();
    }, 500);
}

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
                    <td>${formatarMoeda(item.valor_total / (item.total_pedidos || 1))}</td>
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
                    <td>${formatarMoeda(item.valor_total_vendas / (item.total_pedidos || 1))}</td>
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

// Carregar todos os relatórios ao inicializar
document.addEventListener('DOMContentLoaded', () => {
    carregarResumoGeral();
    carregarMesMaisVendas();
    carregarClientesMaisCompram();
    carregarProdutosMaisVendidos();
    carregarVendasPorFuncionario();
});
