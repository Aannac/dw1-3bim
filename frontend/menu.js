// Configuração da API
const API_BASE_URL = 'http://localhost:3001';

// ===== CARRINHO DE COMPRAS =====
let carrinho = [];
let totalCarrinho = 0;

// Elementos do DOM
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

// Sidebar Toggle
menuToggle.addEventListener('click', () => {
  sidebar.classList.toggle('active');
  sidebarOverlay.classList.toggle('active');
});

sidebarOverlay.addEventListener('click', () => {
  sidebar.classList.remove('active');
  sidebarOverlay.classList.remove('active');
});

// Função para lidar com ações do usuário
function handleUserAction(action) {
  if (action === "gerenciar-conta") {
    alert("Redirecionando para a página de Gerenciar Conta...");
  } else if (action === "sair") {
    alert("Até logo! Volte sempre! 💕");
  }
}

// Emojis de pelúcias para cada produto
const plushEmojis = ['🧸', '🐻', '🐰', '🐶', '🐱', '🦊', '🐼', '🦁', '🐨', '🐯'];

// ===== FUNÇÕES DO CARRINHO =====

function atualizarBadgeCarrinho() {
  const badge = document.getElementById('carrinhoCount');
  const totalItens = carrinho.reduce((sum, item) => sum + item.quantidade, 0);
  badge.textContent = totalItens;
  badge.style.display = totalItens > 0 ? 'inline-block' : 'none';
}

function calcularTotal() {
  totalCarrinho = carrinho.reduce((sum, item) => 
    sum + (item.preco * item.quantidade), 0
  );
  return totalCarrinho;
}

function adicionarAoCarrinho(id, nome, preco, estoque) {
  // Verifica se o produto já está no carrinho
  const itemExistente = carrinho.find(item => item.id === id);
  
  if (itemExistente) {
    // Verifica se há estoque suficiente
    if (itemExistente.quantidade < estoque) {
      itemExistente.quantidade++;
      mostrarNotificacao(`${nome} - Quantidade atualizada! 🎀`, 'success');
    } else {
      mostrarNotificacao(`Estoque insuficiente para ${nome} 😢`, 'warning');
      return;
    }
  } else {
    // Adiciona novo item ao carrinho
    carrinho.push({
      id: id,
      nome: nome,
      preco: preco,
      quantidade: 1,
      estoqueDisponivel: estoque
    });
    mostrarNotificacao(`${nome} adicionado ao carrinho! 💕`, 'success');
  }
  
  atualizarBadgeCarrinho();
  atualizarCarrinhoUI();
}

function removerDoCarrinho(id) {
  const index = carrinho.findIndex(item => item.id === id);
  if (index > -1) {
    const item = carrinho[index];
    mostrarNotificacao(`${item.nome} removido do carrinho`, 'info');
    carrinho.splice(index, 1);
  }
  atualizarBadgeCarrinho();
  atualizarCarrinhoUI();
}

function alterarQuantidade(id, novaQuantidade) {
  const item = carrinho.find(item => item.id === id);
  if (item) {
    if (novaQuantidade > 0 && novaQuantidade <= item.estoqueDisponivel) {
      item.quantidade = novaQuantidade;
    } else if (novaQuantidade > item.estoqueDisponivel) {
      mostrarNotificacao(`Estoque máximo: ${item.estoqueDisponivel} unidades`, 'warning');
      item.quantidade = item.estoqueDisponivel;
    } else {
      removerDoCarrinho(id);
      return;
    }
  }
  atualizarBadgeCarrinho();
  atualizarCarrinhoUI();
}

function atualizarCarrinhoUI() {
  const carrinhoItens = document.getElementById('carrinhoItens');
  const carrinhoVazio = document.getElementById('carrinhoVazio');
  const carrinhoTotal = document.getElementById('carrinhoTotal');
  const btnFinalizarCompra = document.getElementById('btnFinalizarCompra');
  
  if (carrinho.length === 0) {
    carrinhoVazio.style.display = 'block';
    carrinhoItens.innerHTML = '';
    carrinhoTotal.style.display = 'none';
    btnFinalizarCompra.style.display = 'none';
    return;
  }
  
  carrinhoVazio.style.display = 'none';
  carrinhoTotal.style.display = 'block';
  btnFinalizarCompra.style.display = 'block';
  
  carrinhoItens.innerHTML = carrinho.map(item => `
    <div class="carrinho-item">
      <div class="carrinho-item-info">
        <h4>${item.nome}</h4>
        <p>R$ ${item.preco.toFixed(2)}</p>
      </div>
      <div class="carrinho-item-actions">
        <button onclick="alterarQuantidade(${item.id}, ${item.quantidade - 1})" class="btn-qty">-</button>
        <input 
          type="number" 
          value="${item.quantidade}" 
          min="1" 
          max="${item.estoqueDisponivel}"
          onchange="alterarQuantidade(${item.id}, parseInt(this.value))"
          class="input-qty"
        >
        <button onclick="alterarQuantidade(${item.id}, ${item.quantidade + 1})" class="btn-qty">+</button>
        <button onclick="removerDoCarrinho(${item.id})" class="btn-remove">🗑️</button>
      </div>
      <div class="carrinho-item-subtotal">
        Subtotal: R$ ${(item.preco * item.quantidade).toFixed(2)}
      </div>
    </div>
  `).join('');
  
  const total = calcularTotal();
  carrinhoTotal.innerHTML = `
    <div class="total-carrinho">
      <strong>Total:</strong>
      <strong>R$ ${total.toFixed(2)}</strong>
    </div>
  `;
}

function toggleCarrinho() {
  const modalCarrinho = document.getElementById('modalCarrinho');
  modalCarrinho.classList.toggle('active');
  atualizarCarrinhoUI();
}

function limparCarrinho() {
  if (carrinho.length === 0) return;
  
  if (confirm('Deseja realmente limpar o carrinho?')) {
    carrinho = [];
    atualizarBadgeCarrinho();
    atualizarCarrinhoUI();
    mostrarNotificacao('Carrinho limpo', 'info');
  }
}

async function finalizarCompra() {
  if (carrinho.length === 0) {
    mostrarNotificacao('Carrinho vazio!', 'warning');
    return;
  }
  
  // Salva o carrinho no sessionStorage para passar para a página de checkout
  sessionStorage.setItem('carrinho', JSON.stringify(carrinho));
  
  // Redireciona para a página de checkout
  window.location.href = 'checkout.html';
}

// Função para mostrar notificações
function mostrarNotificacao(mensagem, tipo = 'info') {
  const notificacao = document.createElement('div');
  notificacao.className = `notificacao ${tipo}`;
  notificacao.textContent = mensagem;
  document.body.appendChild(notificacao);
  
  setTimeout(() => {
    notificacao.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notificacao.classList.remove('show');
    setTimeout(() => notificacao.remove(), 300);
  }, 3000);
}

// ===== CARREGAR PRODUTOS =====

async function carregarProdutos() {
  try {
    const response = await fetch(`${API_BASE_URL}/produto`);
    
    if (response.ok) {
      const produtos = await response.json();
      renderizarProdutos(produtos);
    } else {
      document.getElementById('productsContainer').innerHTML = 
        '<div class="loading">Erro ao carregar produtos 😢</div>';
    }
  } catch (error) {
    console.error('Erro:', error);
    document.getElementById('productsContainer').innerHTML = 
      '<div class="loading">Não foi possível conectar ao servidor 😢</div>';
  }
}

function renderizarProdutos(produtos) {
  const container = document.getElementById('productsContainer');
  
  if (produtos.length === 0) {
    container.innerHTML = '<div class="loading">Nenhum produto disponível no momento 🧸</div>';
    return;
  }

  container.innerHTML = '';

  produtos.forEach((produto, index) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    let imagemHtml;
    if (produto.imagem_produto) {
      imagemHtml = `<img src="${produto.imagem_produto}" alt="${produto.nome_produto}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 20px;">`;
    } else {
      const emoji = plushEmojis[index % plushEmojis.length];
      imagemHtml = emoji;
    }
    
    const semEstoque = produto.quantidade_estoque <= 0;
    
    card.innerHTML = `
      <div class="product-image">${imagemHtml}</div>
      <div class="product-name">${produto.nome_produto}</div>
      <div class="product-price">R$ ${Number(produto.preco_unitario).toFixed(2)}</div>
      <div class="product-stock ${semEstoque ? 'sem-estoque' : ''}">
        💼 Estoque: ${produto.quantidade_estoque} unidades
      </div>
      <button 
        class="btn-buy ${semEstoque ? 'disabled' : ''}" 
        onclick="adicionarAoCarrinho(${produto.id_produto}, '${produto.nome_produto}', ${produto.preco_unitario}, ${produto.quantidade_estoque})"
        ${semEstoque ? 'disabled' : ''}
      >
        ${semEstoque ? '😢 Sem Estoque' : '💕 Adicionar ao Carrinho'}
      </button>
    `;
    
    container.appendChild(card);
  });
}

// Carregar produtos ao inicializar a página
window.addEventListener('DOMContentLoaded', () => {
  carregarProdutos();
  atualizarBadgeCarrinho();
});