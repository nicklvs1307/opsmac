/**
 * perdas.js - Gerenciamento de perdas para o Etiquetafy
 * Este script implementa as funcionalidades de CRUD para registro de perdas
 * utilizando localStorage como banco de dados local
 */

// Inicialização do banco de dados local
function initPerdasDatabase() {
    // Verifica se já existe a lista de perdas no localStorage
    if (!localStorage.getItem('perdas')) {
        // Inicializa com uma lista vazia
        localStorage.setItem('perdas', JSON.stringify([]));
    }
}

// Função para obter todas as perdas
function getPerdas() {
    return JSON.parse(localStorage.getItem('perdas') || '[]');
}

// Função para adicionar uma nova perda
function addPerda(perda) {
    const perdas = getPerdas();
    
    // Gera um ID único para a perda
    perda.id = Date.now().toString();
    
    // Define a data atual se não for fornecida
    if (!perda.data) {
        const dataAtual = new Date();
        perda.data = dataAtual.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    }
    
    perdas.push(perda);
    localStorage.setItem('perdas', JSON.stringify(perdas));
    
    // Atualiza o saldo do produto (reduz o estoque)
    atualizarSaldoProduto(perda.produtoId, 'saida', perda.quantidade);
    
    return perda;
}

// Função para atualizar uma perda existente
function updatePerda(id, dadosAtualizados) {
    const perdas = getPerdas();
    const index = perdas.findIndex(p => p.id === id);
    
    if (index !== -1) {
        // Reverte a perda anterior
        const perdaAntiga = perdas[index];
        atualizarSaldoProduto(
            perdaAntiga.produtoId, 
            'entrada', // Reverte a saída
            perdaAntiga.quantidade
        );
        
        // Aplica a nova perda
        perdas[index] = { ...perdaAntiga, ...dadosAtualizados };
        localStorage.setItem('perdas', JSON.stringify(perdas));
        
        // Registra a nova saída
        atualizarSaldoProduto(
            perdas[index].produtoId, 
            'saida', 
            perdas[index].quantidade
        );
        
        return perdas[index];
    }
    
    return null;
}

// Função para excluir uma perda
function deletePerda(id) {
    const perdas = getPerdas();
    const index = perdas.findIndex(p => p.id === id);
    
    if (index !== -1) {
        // Reverte a perda a ser excluída (devolve ao estoque)
        const perda = perdas[index];
        atualizarSaldoProduto(
            perda.produtoId, 
            'entrada', // Reverte a saída
            perda.quantidade
        );
    }
    
    const novaLista = perdas.filter(p => p.id !== id);
    localStorage.setItem('perdas', JSON.stringify(novaLista));
    return true;
}

// Função para buscar uma perda pelo ID
function getPerdaById(id) {
    const perdas = getPerdas();
    return perdas.find(p => p.id === id) || null;
}

// Função para buscar perdas por produto (pesquisa parcial)
function searchPerdas(termo) {
    if (!termo) return getPerdas();
    
    const perdas = getPerdas();
    const termoLower = termo.toLowerCase();
    
    // Busca produtos que correspondem ao termo
    const produtos = JSON.parse(localStorage.getItem('produtos') || '[]');
    const produtosIds = produtos
        .filter(p => p.nome.toLowerCase().includes(termoLower))
        .map(p => p.id);
    
    return perdas.filter(p => 
        produtosIds.includes(p.produtoId) || 
        (p.motivo && p.motivo.toLowerCase().includes(termoLower)) ||
        (p.observacao && p.observacao.toLowerCase().includes(termoLower))
    );
}

// Função para atualizar o saldo de um produto (reutiliza a função do estoque.js)
function atualizarSaldoProduto(produtoId, tipo, quantidade) {
    // Verifica se a função já existe (definida em estoque.js)
    if (typeof window.atualizarSaldoProduto === 'function') {
        window.atualizarSaldoProduto(produtoId, tipo, quantidade);
        return;
    }
    
    // Implementação de fallback caso a função não esteja disponível
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

// Função para renderizar a tabela de perdas
function renderizarTabelaPerdas(perdas = null) {
    const tbody = document.querySelector('#perdas-table tbody');
    if (!tbody) return;
    
    // Se não for fornecida uma lista, busca todas
    if (perdas === null) {
        perdas = getPerdas();
    }
    
    // Limpa a tabela
    tbody.innerHTML = '';
    
    if (perdas.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="6" class="text-center">Nenhuma perda registrada</td>';
        tbody.appendChild(tr);
        return;
    }
    
    // Obtém a lista de produtos para exibir os nomes
    const produtos = JSON.parse(localStorage.getItem('produtos') || '[]');
    const produtosMap = {};
    produtos.forEach(p => {
        produtosMap[p.id] = p.nome;
    });
    
    // Mapeamento de motivos para exibição
    const motivosMap = {
        'vencimento': 'Vencimento',
        'avaria': 'Avaria',
        'qualidade': 'Problema de Qualidade',
        'outro': 'Outro'
    };
    
    // Adiciona cada perda à tabela
    perdas.forEach(perda => {
        const tr = document.createElement('tr');
        
        // Formata a data para exibição
        const data = perda.data ? new Date(perda.data) : new Date();
        const dataFormatada = data.toLocaleDateString('pt-BR');
        
        tr.innerHTML = `
            <td>${produtosMap[perda.produtoId] || 'Produto não encontrado'}</td>
            <td>${perda.quantidade}</td>
            <td>${motivosMap[perda.motivo] || perda.motivo}</td>
            <td>${dataFormatada}</td>
            <td>${perda.observacao || '-'}</td>
            <td class="action-buttons">
                <button class="btn-action btn-edit-perda" data-id="${perda.id}" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="btn-action btn-delete-perda" data-id="${perda.id}" title="Excluir"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    // Adiciona os event listeners para os botões de ação
    adicionarEventListenersTabelaPerda();
}

// Função para adicionar event listeners aos botões da tabela
function adicionarEventListenersTabelaPerda() {
    // Botões de editar
    document.querySelectorAll('.btn-edit-perda').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            abrirModalEditarPerda(id);
        });
    });
    
    // Botões de excluir
    document.querySelectorAll('.btn-delete-perda').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            confirmarExclusaoPerda(id);
        });
    });
}

// Função para abrir o modal de edição
function abrirModalEditarPerda(id) {
    const perda = getPerdaById(id);
    if (!perda) return;
    
    // Preenche o formulário com os dados da perda
    document.getElementById('modal-perda-title').textContent = 'Editar Registro de Perda';
    document.getElementById('perda-id').value = perda.id;
    document.getElementById('perda-produto').value = perda.produtoId;
    document.getElementById('perda-quantidade').value = perda.quantidade;
    document.getElementById('perda-motivo').value = perda.motivo;
    document.getElementById('perda-observacao').value = perda.observacao || '';
    
    // Abre o modal
    const modal = document.getElementById('modal-perda');
    modal.style.display = 'block';
}

// Função para abrir o modal para nova perda
function abrirModalNovaPerda() {
    // Limpa o formulário
    document.getElementById('modal-perda-title').textContent = 'Novo Registro de Perda';
    document.getElementById('perda-id').value = '';
    document.getElementById('form-perda').reset();
    
    // Abre o modal
    const modal = document.getElementById('modal-perda');
    modal.style.display = 'block';
}

// Função para confirmar exclusão
function confirmarExclusaoPerda(id) {
    const perda = getPerdaById(id);
    if (!perda) return;
    
    // Obtém o nome do produto
    const produtos = JSON.parse(localStorage.getItem('produtos') || '[]');
    const produto = produtos.find(p => p.id === perda.produtoId);
    const nomeProduto = produto ? produto.nome : 'Produto não encontrado';
    
    if (confirm(`Deseja realmente excluir o registro de perda de ${nomeProduto}?`)) {
        deletePerda(id);
        renderizarTabelaPerdas();
    }
}

// Função para salvar a perda (nova ou edição)
function salvarPerda(event) {
    event.preventDefault();
    
    const id = document.getElementById('perda-id').value;
    const produtoId = document.getElementById('perda-produto').value;
    const quantidade = document.getElementById('perda-quantidade').value;
    const motivo = document.getElementById('perda-motivo').value;
    const observacao = document.getElementById('perda-observacao').value;
    
    const perda = {
        produtoId,
        quantidade,
        motivo,
        observacao
    };
    
    if (id) {
        // Atualização
        updatePerda(id, perda);
    } else {
        // Nova perda
        addPerda(perda);
    }
    
    // Fecha o modal e atualiza a tabela
    fecharModalPerda();
    renderizarTabelaPerdas();
}

// Função para fechar o modal
function fecharModalPerda() {
    const modal = document.getElementById('modal-perda');
    modal.style.display = 'none';
}

// Função para carregar os produtos no select
function carregarProdutosSelectPerda() {
    const selectProduto = document.getElementById('perda-produto');
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
    // Verifica se estamos na seção de perdas
    const perdasSection = document.getElementById('perdas-section');
    if (!perdasSection) return;
    
    // Inicializa o banco de dados local
    initPerdasDatabase();
    
    // Event listener para o botão de nova perda
    const btnNovaPerda = document.getElementById('btn-nova-perda');
    if (btnNovaPerda) {
        btnNovaPerda.addEventListener('click', () => {
            carregarProdutosSelectPerda();
            abrirModalNovaPerda();
        });
    }
    
    // Event listener para o formulário
    const formPerda = document.getElementById('form-perda');
    if (formPerda) {
        formPerda.addEventListener('submit', salvarPerda);
    }
    
    // Event listener para fechar o modal
    const closeModal = document.querySelector('#modal-perda .close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', fecharModalPerda);
    }
    
    // Event listener para o botão cancelar
    const btnCancelar = document.getElementById('btn-cancelar-perda');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', fecharModalPerda);
    }
    
    // Event listener para o campo de busca
    const searchInput = document.getElementById('search-perda-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const termo = searchInput.value.trim();
            const resultados = searchPerdas(termo);
            renderizarTabelaPerdas(resultados);
        });
    }
    
    // Fecha o modal se clicar fora dele
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('modal-perda');
        if (event.target === modal) {
            fecharModalPerda();
        }
    });
    
    // Renderiza a tabela inicial
    renderizarTabelaPerdas();
});

// Adiciona event listeners para a navegação
document.addEventListener('DOMContentLoaded', () => {
    const navPerdas = document.getElementById('nav-perdas');
    if (navPerdas) {
        navPerdas.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Esconde todas as seções
            document.querySelectorAll('.content-section').forEach(section => {
                section.style.display = 'none';
            });
            
            // Remove a classe 'active' de todos os itens de navegação
            document.querySelectorAll('.menu li').forEach(item => {
                item.classList.remove('active');
            });
            
            // Mostra a seção de perdas
            document.getElementById('perdas-section').style.display = 'block';
            
            // Adiciona a classe 'active' ao item de navegação
            navPerdas.classList.add('active');
            
            // Renderiza a tabela
            renderizarTabelaPerdas();
            
            // Carrega os produtos no select
            carregarProdutosSelectPerda();
        });
    }
});