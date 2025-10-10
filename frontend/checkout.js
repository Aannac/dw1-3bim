// Configuração da API
const API_BASE_URL = 'http://localhost:3001';

// Variáveis globais
let carrinho = [];
let totalCarrinho = 0;
let formasPagamento = [];
let formaPagamentoSelecionada = null;

// Função para voltar ao menu
function voltarMenu() {
  window.location.href = 'menu.html';
}

// Função para mostrar mensagens
function mostrarMensagem(texto, tipo = 'info') {
  const messageContainer = document.getElementById('messageContainer');
  const message = document.createElement('div');
  message.className = `message ${tipo}`;
  message.textContent = texto;
  messageContainer.appendChild(message);

  setTimeout(() => {
    message.remove();
  }, 3000);
}

// Carregar dados do carrinho (passados via variável global do menu.js)
function carregarCarrinho() {
  // Verifica se há dados do carrinho no sessionStorage ou variável global
  const carrinhoData = sessionStorage.getItem('carrinho');
  
  if (carrinhoData) {
    carrinho = JSON.parse(carrinhoData);
  } else if (window.opener && window.opener.carrinho) {
    carrinho = window.opener.carrinho;
  }

  if (carrinho.length === 0) {
    mostrarMensagem('Carrinho vazio! Redirecionando...', 'warning');
    setTimeout(() => voltarMenu(), 2000);
    return;
  }

  renderizarResumo();
}

// Renderizar resumo do pedido
function renderizarResumo() {
  const resumoPedido = document.getElementById('resumoPedido');
  
  resumoPedido.innerHTML = carrinho.map(item => `
    <div class="resumo-item">
      <div class="resumo-item-info">
        <h4>${item.nome}</h4>
        <p>Quantidade: ${item.quantidade} unidade(s)</p>
        <p>Preço unitário: R$ ${item.preco.toFixed(2)}</p>
      </div>
      <div class="resumo-item-preco">
        R$ ${(item.preco * item.quantidade).toFixed(2)}
      </div>
    </div>
  `).join('');

  totalCarrinho = carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
  document.getElementById('valorTotal').textContent = totalCarrinho.toFixed(2);
  document.getElementById('valorTotalPagamento').textContent = totalCarrinho.toFixed(2);
}

// Carregar formas de pagamento do banco
async function carregarFormasPagamento() {
  try {
    const response = await fetch(`${API_BASE_URL}/forma_pagamento`);
    
    if (response.ok) {
      formasPagamento = await response.json();
      renderizarFormasPagamento();
    } else {
      mostrarMensagem('Erro ao carregar formas de pagamento', 'error');
    }
  } catch (error) {
    console.error('Erro:', error);
    mostrarMensagem('Erro ao conectar com o servidor', 'error');
  }
}

// Renderizar formas de pagamento
function renderizarFormasPagamento() {
  const container = document.getElementById('formasPagamento');
  
  if (formasPagamento.length === 0) {
    container.innerHTML = '<div class="loading">Nenhuma forma de pagamento disponível 😢</div>';
    return;
  }

  // Ícones para cada forma de pagamento
  const icones = {
    'pix': '💳',
    'dinheiro': '💵',
    'cartão': '💳',
    'crédito': '💳',
    'débito': '💳',
    'boleto': '📄',
    'transferência': '🏦',
    'vale': '🎫',
    'cheque': '📝'
  };

  container.innerHTML = formasPagamento.map(forma => {
    const nomeNormalizado = forma.nome_forma_pagamento.toLowerCase();
    let icone = '💰';
    
    // Encontra o ícone apropriado
    for (const [key, value] of Object.entries(icones)) {
      if (nomeNormalizado.includes(key)) {
        icone = value;
        break;
      }
    }

    return `
      <div class="forma-pagamento-card" onclick="selecionarFormaPagamento(${forma.id_forma_pagamento}, '${forma.nome_forma_pagamento}')">
        <div class="forma-pagamento-icon">${icone}</div>
        <div class="forma-pagamento-nome">${forma.nome_forma_pagamento}</div>
      </div>
    `;
  }).join('');
}

// Selecionar forma de pagamento
function selecionarFormaPagamento(id, nome) {
  formaPagamentoSelecionada = { id, nome };
  
  // Remove seleção anterior
  document.querySelectorAll('.forma-pagamento-card').forEach(card => {
    card.classList.remove('selected');
  });
  
  // Adiciona seleção na card clicada
  event.currentTarget.classList.add('selected');
  
  // Esconde seções de pagamento
  document.getElementById('pixSection').style.display = 'none';
  document.getElementById('outrosPagamentoSection').style.display = 'none';
  
  // Verifica se é PIX
  const nomeNormalizado = nome.toLowerCase();
  if (nomeNormalizado.includes('pix')) {
    document.getElementById('pixSection').style.display = 'block';
    gerarQRCodePix();
  } else {
    document.getElementById('outrosPagamentoSection').style.display = 'block';
    document.getElementById('formaSelecionadaNome').textContent = nome;
  }
  
  mostrarMensagem(`Forma de pagamento selecionada: ${nome}`, 'success');
}

// Gerar QR Code PIX
function gerarQRCodePix() {
  const valor = totalCarrinho.toFixed(2);
  const chavePix = 'cf227dbe-75ae-497d-927f-a292d805bfda';
  const nomeRecebedor = 'PLUSHIES STORE';
  const cidade = 'CAMPO MOURAO';
  const descricao = 'Pagamento Plushies';

  // Função para formatar campos do payload Pix
  function formatField(id, value) {
    const length = value.length.toString().padStart(2, '0');
    return id + length + value;
  }

  // Constrói o payload Pix sem o CRC
  let payloadSemCRC =
    formatField("00", "01") +
    formatField("26",
      formatField("00", "BR.GOV.BCB.PIX") +
      formatField("01", chavePix) +
      formatField("02", descricao)
    ) +
    formatField("52", "0000") +
    formatField("53", "986") +
    formatField("54", valor) +
    formatField("58", "BR") +
    formatField("59", nomeRecebedor) +
    formatField("60", cidade) +
    formatField("62", formatField("05", "***")) +
    "6304";

  // Função para gerar CRC16
  function crc16(str) {
    let crc = 0xFFFF;
    for (let c = 0; c < str.length; c++) {
      crc ^= str.charCodeAt(c) << 8;
      for (let i = 0; i < 8; i++) {
        if ((crc & 0x8000) !== 0) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc <<= 1;
        }
        crc &= 0xFFFF;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }

  const crc = crc16(payloadSemCRC);
  const payloadFinal = payloadSemCRC + crc;

  const qrCodeDiv = document.getElementById('qrcodeContainer');
  qrCodeDiv.innerHTML = '';

  // Gera o QR code
  const qrcode = new QRCode(qrCodeDiv, {
    text: payloadFinal,
    width: 250,
    height: 250,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  });

  // Adiciona informações
  setTimeout(() => {
    const info = document.createElement('div');
    info.className = 'qrcode-info';
    info.innerHTML = `
      <p><strong>Nome:</strong> ${nomeRecebedor}</p>
      <p><strong>Chave PIX:</strong> ${chavePix}</p>
      <p><strong>Valor:</strong> R$ ${valor}</p>
    `;
    qrCodeDiv.appendChild(info);
  }, 100);
}

// Confirmar pagamento PIX
async function confirmarPagamento() {
  await finalizarPedido();
}

// Processar pagamento com outros métodos
async function processarPagamentoOutros() {
  const numeroCartao = document.getElementById('numeroCartao').value;
  const validadeCartao = document.getElementById('validadeCartao').value;
  const cvvCartao = document.getElementById('cvvCartao').value;
  const nomeCartao = document.getElementById('nomeCartao').value;

  // Validação básica
  if (!numeroCartao || !validadeCartao || !cvvCartao || !nomeCartao) {
    mostrarMensagem('Preencha todos os campos!', 'warning');
    return;
  }

  mostrarMensagem('Processando pagamento... 💕', 'info');
  
  // Simula processamento
  setTimeout(async () => {
    await finalizarPedido();
  }, 2000);
}

// Finalizar pedido e salvar no banco
async function finalizarPedido() {
  try {
    // 1. Criar o pedido
    const pedidoData = {
      data_pedido: new Date().toISOString().split('T')[0],
      cliente_pessoa_cpf_pessoa: '11111111111', // CPF padrão - você pode pegar do login
      funcionario_pessoa_cpf_pessoa: '22222222222' // Funcionário padrão
    };

    const responsePedido = await fetch(`${API_BASE_URL}/pedido`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedidoData)
    });

    if (!responsePedido.ok) {
      throw new Error('Erro ao criar pedido');
    }

    const pedidoCriado = await responsePedido.json();
    const idPedido = pedidoCriado.id_pedido;

    // 2. Adicionar itens do pedido (pedido_has_produto)
    for (const item of carrinho) {
      const itemData = {
        pedido_id_pedido: idPedido,
        produto_id_produto: item.id,
        quantidade: item.quantidade,
        preco_unitario: item.preco
      };

      await fetch(`${API_BASE_URL}/pedido_has_produto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });

      // 3. Atualizar estoque do produto
      const responseEstoque = await fetch(`${API_BASE_URL}/produto/${item.id}`);
      if (responseEstoque.ok) {
        const produto = await responseEstoque.json();
        const novoEstoque = produto.quantidade_estoque - item.quantidade;

        await fetch(`${API_BASE_URL}/produto/${item.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome_produto: produto.nome_produto,
            preco_unitario: produto.preco_unitario,
            quantidade_estoque: novoEstoque
          })
        });
      }
    }

    // 4. Criar pagamento
    const pagamentoData = {
      pedido_id_pedido: idPedido,
      data_pagamento: new Date().toISOString(),
      valor_total_pagamento: totalCarrinho
    };

    await fetch(`${API_BASE_URL}/pagamento`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pagamentoData)
    });

    // 5. Associar forma de pagamento ao pagamento
    if (formaPagamentoSelecionada) {
      const pagamentoFormaData = {
        pagamento_id_pedido: idPedido,
        forma_pagamento_id_forma_pagamento: formaPagamentoSelecionada.id,
        valor_pago: totalCarrinho
      };

      await fetch(`${API_BASE_URL}/pagamento_has_forma_pagamento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pagamentoFormaData)
      });
    }

    // 6. Mostrar modal de sucesso
    document.getElementById('numeroPedido').textContent = `#${idPedido}`;
    document.getElementById('modalSucesso').classList.add('active');

    // Limpar carrinho do sessionStorage
    sessionStorage.removeItem('carrinho');

  } catch (error) {
    console.error('Erro ao finalizar pedido:', error);
    mostrarMensagem('Erro ao finalizar pedido. Tente novamente.', 'error');
  }
}

// Voltar para a loja
function voltarParaLoja() {
  window.location.href = 'menu.html';
}

// Formatar número do cartão
document.addEventListener('DOMContentLoaded', () => {
  carregarCarrinho();
  carregarFormasPagamento();

  // Máscara para número do cartão
  const numeroCartao = document.getElementById('numeroCartao');
  if (numeroCartao) {
    numeroCartao.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\s/g, '');
      let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
      e.target.value = formattedValue;
    });
  }

  // Máscara para validade
  const validadeCartao = document.getElementById('validadeCartao');
  if (validadeCartao) {
    validadeCartao.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
      }
      e.target.value = value;
    });
  }

  // Apenas números no CVV
  const cvvCartao = document.getElementById('cvvCartao');
  if (cvvCartao) {
    cvvCartao.addEventListener('input', function(e) {
      e.target.value = e.target.value.replace(/\D/g, '');
    });
  }
});