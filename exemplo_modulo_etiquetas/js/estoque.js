/**
 * estoque.js - Gerenciamento de estoque para o Etiquetafy
 * Este script implementa as funcionalidades de CRUD para movimentações de estoque
 * utilizando localStorage como banco de dados local
 */

// Inicialização do banco de dados local
function initEstoqueDatabase() {
    // Verifica se já existe a lista de movimentações no localStorage
    if (!localStorage.getItem('movimentacoes')) {
        // Inicializa com uma lista vazia
        localStorage.setItem('movimentacoes', JSON.stringify([]));
    }
}

// Função para obter todas as movimentações
function getMovimentacoes() {
    return JSON.parse(localStorage.getItem('movimentacoes') || '[]');
}

// Função para adicionar uma nova movimentação
function addMovimentacao(movimentacao) {
    const movimentacoes = getMovimentacoes();
    
    // Gera um ID único para a movimentação
    movimentacao.id = Date.now().toString();
    
    // Define a data atual se não for fornecida
    if (!movimentacao.data) {
        const dataAtual = new Date();
        movimentacao.data = dataAtual.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    }
    
    movimentacoes.push(movimentacao);
    localStorage.setItem('movimentacoes', JSON.stringify(movimentacoes));
    
    // Atualiza o saldo do produto
    atualizarSaldoProduto(movimentacao.produtoId, movimentacao.tipo, movimentacao.quantidade);
    
    return movimentacao;
}

// Função para atualizar uma movimentação existente
function updateMovimentacao(id, dadosAtualizados) {
    const movimentacoes = getMovimentacoes();
    const index = movimentacoes.findIndex(m => m.id === id);
    
    if (index !== -1) {
        // Reverte a movimentação anterior
        const movimentacaoAntiga = movimentacoes[index];
        atualizarSaldoProduto(
            movimentacaoAntiga.produtoId, 
            movimentacaoAntiga.tipo === 'entrada' ? 'saida' : 'entrada', 
            movimentacaoAntiga.quantidade
        );
        
        // Aplica a nova movimentação
        movimentacoes[index] = { ...movimentacaoAntiga, ...dadosAtualizados };
        localStorage.setItem('movimentacoes', JSON.stringify(movimentacoes));
        
        atualizarSaldoProduto(
            movimentacoes[index].produtoId, 
            movimentacoes[index].tipo, 
            movimentacoes[index].quantidade
        );
        
        return movimentacoes[index];
    }
    
    return null;
}

// Função para excluir uma movimentação
function deleteMovimentacao(id) {
    const movimentacoes = getMovimentacoes();
    const index = movimentacoes.findIndex(m => m.id === id);
    
    if (index !== -1) {
        // Reverte a movimentação a ser excluída
        const movimentacao = movimentacoes[index];
        atualizarSaldoProduto(
            movimentacao.produtoId, 
            movimentacao.tipo === 'entrada' ? 'saida' : 'entrada', 
            movimentacao.quantidade
        );
    }
    
    const novaLista = movimentacoes.filter(m => m.id !== id);
    localStorage.setItem('movimentacoes', JSON.stringify(novaLista));
    return true;
}

// Função para buscar uma movimentação pelo ID
function getMovimentacaoById(id) {
    const movimentacoes = getMovimentacoes();
    return movimentacoes.find(m => m.id === id) || null;
}

// Função para buscar movimentações por produto (pesquisa parcial)
function searchMovimentacoes(termo) {
    if (!termo) return getMovimentacoes();
    
    const movimentacoes = getMovimentacoes();
    const termoLower = termo.toLowerCase();
    
    // Busca produtos que correspondem ao termo
    const produtos = JSON.parse(localStorage.getItem('produtos') || '[]');
    const produtosIds = produtos
        .filter(p => p.nome.toLowerCase().includes(termoLower))
        .map(p => p.id);
    
    return movimentacoes.filter(m => 
        produtosIds.includes(m.produtoId) || 
        (m.observacao && m.observacao.toLowerCase().includes(termoLower))
    );
}

// Função para inicializar o banco de dados de saldos
function initSaldosDatabase() {
    if (!localStorage.getItem('saldos')) {
        localStorage.setItem('saldos', JSON.stringify({}));
    }
}

// Função para atualizar o saldo de um produto
function atualizarSaldoProduto(produtoId, tipo, quantidade) {
    const saldos = JSON.parse(localStorage.getItem('saldos') || '{}');
    
    // Inicializa o saldo se não existir
    if (!saldos[produtoId]) {
        saldos[produtoId] = 0;
    }
    
    // Atualiza o saldo conforme o tipo de movimentação
    if (tipo === 'entrada') {
        saldos[produtoId] += parseInt(quantidade);
    } else if (tipo === 'saida') {
        saldos[produtoId] -= parseInt(quantidade);
    }
    
    localStorage.setItem('saldos', JSON.stringify(saldos));
}

// Função para obter o saldo atual de um produto
function getSaldoProduto(produtoId) {
    const saldos = JSON.parse(localStorage.getItem('saldos') || '{}');
    return saldos[produtoId] || 0;
}

// Função para obter todos os saldos
function getAllSaldos() {
    return JSON.parse(localStorage.getItem('saldos') || '{}');
}

// Função para renderizar a tabela de movimentações
function renderizarTabelaEstoque(movimentacoes = null) {
    const tbody = document.querySelector('#estoque-table tbody');
    if (!tbody) return;
    
    // Se não for fornecida uma lista, busca todas
    if (movimentacoes === null) {
        movimentacoes = getMovimentacoes();
    }
    
    // Limpa a tabela
    tbody.innerHTML = '';
    
    if (movimentacoes.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="6" class="text-center">Nenhuma movimentação registrada</td>';
        tbody.appendChild(tr);
        return;
    }
    
    // Obtém a lista de produtos para exibir os nomes
    const produtos = JSON.parse(localStorage.getItem('produtos') || '[]');
    const produtosMap = {};
    produtos.forEach(p => {
        produtosMap[p.id] = p.nome;
    });
    
    // Adiciona cada movimentação à tabela
    movimentacoes.forEach(movimentacao => {
        const tr = document.createElement('tr');
        
        // Formata a data para exibição
        const data = movimentacao.data ? new Date(movimentacao.data) : new Date();
        const dataFormatada = data.toLocaleDateString('pt-BR');
        
        tr.innerHTML = `
            <td>${produtosMap[movimentacao.produtoId] || 'Produto não encontrado'}</td>
            <td><span class="${movimentacao.tipo === 'entrada' ? 'status-active' : 'status-inactive'}">${movimentacao.tipo === 'entrada' ? 'Entrada' : 'Saída'}</span></td>
            <td>${movimentacao.quantidade}</td>
            <td>${dataFormatada}</td>
            <td>${movimentacao.observacao || '-'}</td>
            <td class="action-buttons">
                <button class="btn-action btn-edit-estoque" data-id="${movimentacao.id}" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="btn-action btn-delete-estoque" data-id="${movimentacao.id}" title="Excluir"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    // Adiciona os event listeners para os botões de ação
    adicionarEventListenersTabelaEstoque();
}

// Função para adicionar event listeners aos botões da tabela
function adicionarEventListenersTabelaEstoque() {
    // Botões de editar
    document.querySelectorAll('.btn-edit-estoque').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            abrirModalEditarEstoque(id);
        });
    });
    
    // Botões de excluir
    document.querySelectorAll('.btn-delete-estoque').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            confirmarExclusaoEstoque(id);
        });
    });
}

// Função para abrir o modal de edição
function abrirModalEditarEstoque(id) {
    const movimentacao = getMovimentacaoById(id);
    if (!movimentacao) return;
    
    // Preenche o formulário com os dados da movimentação
    document.getElementById('modal-estoque-title').textContent = 'Editar Movimentação';
    document.getElementById('estoque-id').value = movimentacao.id;
    document.getElementById('estoque-produto').value = movimentacao.produtoId;
    document.getElementById('estoque-tipo').value = movimentacao.tipo;
    document.getElementById('estoque-quantidade').value = movimentacao.quantidade;
    document.getElementById('estoque-observacao').value = movimentacao.observacao || '';
    
    // Abre o modal
    const modal = document.getElementById('modal-estoque');
    modal.style.display = 'block';
}

// Função para abrir o modal para nova movimentação
function abrirModalNovoEstoque() {
    // Limpa o formulário
    document.getElementById('modal-estoque-title').textContent = 'Nova Movimentação de Estoque';
    document.getElementById('estoque-id').value = '';
    document.getElementById('form-estoque').reset();
    
    // Abre o modal
    const modal = document.getElementById('modal-estoque');
    modal.style.display = 'block';
}

// Função para confirmar exclusão
function confirmarExclusaoEstoque(id) {
    const movimentacao = getMovimentacaoById(id);
    if (!movimentacao) return;
    
    // Obtém o nome do produto
    const produtos = JSON.parse(localStorage.getItem('produtos') || '[]');
    const produto = produtos.find(p => p.id === movimentacao.produtoId);
    const nomeProduto = produto ? produto.nome : 'Produto não encontrado';
    
    if (confirm(`Deseja realmente excluir a movimentação de ${movimentacao.tipo} de ${nomeProduto}?`)) {
        deleteMovimentacao(id);
        renderizarTabelaEstoque();
    }
}

// Função para salvar a movimentação (nova ou edição)
function salvarEstoque(event) {
    event.preventDefault();
    
    const id = document.getElementById('estoque-id').value;
    const produtoId = document.getElementById('estoque-produto').value;
    const tipo = document.getElementById('estoque-tipo').value;
    const quantidade = document.getElementById('estoque-quantidade').value;
    const observacao = document.getElementById('estoque-observacao').value;
    
    const movimentacao = {
        produtoId,
        tipo,
        quantidade,
        observacao
    };
    
    if (id) {
        // Atualização
        updateMovimentacao(id, movimentacao);
    } else {
        // Nova movimentação
        addMovimentacao(movimentacao);
    }
    
    // Fecha o modal e atualiza a tabela
    fecharModalEstoque();
    renderizarTabelaEstoque();
}

// Função para fechar o modal
function fecharModalEstoque() {
    const modal = document.getElementById('modal-estoque');
    modal.style.display = 'none';
}

// Função para carregar os produtos no select
function carregarProdutosSelect() {
    const selectProduto = document.getElementById('estoque-produto');
    if (!selectProduto) return;
    
    // Limpa as opções existentes, mantendo apenas a primeira
    while (selectProduto.options.length > 1) {
        selectProduto.remove(1);
    }
    
    // Obtém a lista de produtos
    const produtos = JSON.parse(localStorage.getItem('produtos') || '[]');
    
    // Adiciona cada produto como uma opção
    produtos.forEach(produto => {
        if (produto.status === 'ativo') {
            const option = document.createElement('option');
            option.value = produto.id;
            option.textContent = produto.nome;
            selectProduto.appendChild(option);
        }
    });
}

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se estamos na seção de estoque
    const estoqueSection = document.getElementById('estoque-section');
    if (!estoqueSection) return;
    
    // Inicializa os bancos de dados locais
    initEstoqueDatabase();
    initSaldosDatabase();
    
    // Event listener para o botão de nova movimentação
    const btnNovaMovimentacao = document.getElementById('btn-nova-movimentacao');
    if (btnNovaMovimentacao) {
        btnNovaMovimentacao.addEventListener('click', () => {
            carregarProdutosSelect();
            abrirModalNovoEstoque();
        });
    }
    
    // Event listener para o formulário
    const formEstoque = document.getElementById('form-estoque');
    if (formEstoque) {
        formEstoque.addEventListener('submit', salvarEstoque);
    }
    
    // Event listener para fechar o modal
    const closeModal = document.querySelector('#modal-estoque .close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', fecharModalEstoque);
    }
    
    // Event listener para o botão cancelar
    const btnCancelar = document.getElementById('btn-cancelar-estoque');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', fecharModalEstoque);
    }
    
    // Event listener para o campo de busca
    const searchInput = document.getElementById('search-estoque-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const termo = searchInput.value.trim();
            const resultados = searchMovimentacoes(termo);
            renderizarTabelaEstoque(resultados);
        });
    }
    
    // Fecha o modal se clicar fora dele
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('modal-estoque');
        if (event.target === modal) {
            fecharModalEstoque();
        }
    });
    
    // Renderiza a tabela inicial
    renderizarTabelaEstoque();
});

// Adiciona event listeners para a navegação
document.addEventListener('DOMContentLoaded', () => {
    const navEstoque = document.getElementById('nav-estoque');
    if (navEstoque) {
        navEstoque.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Esconde todas as seções
            document.querySelectorAll('.content-section').forEach(section => {
                section.style.display = 'none';
            });
            
            // Remove a classe 'active' de todos os itens de navegação
            document.querySelectorAll('.menu li').forEach(item => {
                item.classList.remove('active');
            });
            
            // Mostra a seção de estoque
            document.getElementById('estoque-section').style.display = 'block';
            
            // Adiciona a classe 'active' ao item de navegação
            navEstoque.classList.add('active');
            
            // Renderiza a tabela
            renderizarTabelaEstoque();
            
            // Carrega os produtos no select
            carregarProdutosSelect();
        });
    }
});