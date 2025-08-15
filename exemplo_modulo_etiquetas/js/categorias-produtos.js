/**
 * categorias-produtos.js - Gerenciamento de categorias e produtos para o Etiquetafy
 * Este script implementa as funcionalidades de CRUD para categorias e produtos
 * utilizando localStorage como banco de dados local
 */

// ==================== GERENCIAMENTO DE CATEGORIAS ====================

// Inicialização do banco de dados local para categorias
function initCategoriasDatabase() {
    // Verifica se já existe a lista de categorias no localStorage
    if (!localStorage.getItem('categorias')) {
        // Inicializa com uma lista vazia
        localStorage.setItem('categorias', JSON.stringify([]));
    }
}

// Função para obter todas as categorias
function getCategorias() {
    return JSON.parse(localStorage.getItem('categorias') || '[]');
}

// Função para adicionar uma nova categoria
function addCategoria(categoria) {
    const categorias = getCategorias();
    
    // Gera um ID único para a categoria
    categoria.id = Date.now().toString();
    categoria.status = categoria.status || 'ativo';
    
    categorias.push(categoria);
    localStorage.setItem('categorias', JSON.stringify(categorias));
    
    return categoria;
}

// Função para atualizar uma categoria existente
function updateCategoria(id, dadosAtualizados) {
    const categorias = getCategorias();
    const index = categorias.findIndex(c => c.id === id);
    
    if (index !== -1) {
        categorias[index] = { ...categorias[index], ...dadosAtualizados };
        localStorage.setItem('categorias', JSON.stringify(categorias));
        return categorias[index];
    }
    
    return null;
}

// Função para excluir uma categoria
function deleteCategoria(id) {
    const categorias = getCategorias();
    const novaLista = categorias.filter(c => c.id !== id);
    
    localStorage.setItem('categorias', JSON.stringify(novaLista));
    return true;
}

// Função para buscar uma categoria pelo ID
function getCategoriaById(id) {
    const categorias = getCategorias();
    return categorias.find(c => c.id === id) || null;
}

// Função para buscar categorias por nome (pesquisa parcial)
function searchCategorias(termo) {
    if (!termo) return getCategorias();
    
    const categorias = getCategorias();
    const termoLower = termo.toLowerCase();
    
    return categorias.filter(c => 
        c.nome.toLowerCase().includes(termoLower)
    );
}

// Função para renderizar a tabela de categorias
function renderizarTabelaCategorias(categorias = null) {
    const tbody = document.querySelector('#categorias-table tbody');
    if (!tbody) return;
    
    // Se não for fornecida uma lista, busca todas
    if (categorias === null) {
        categorias = getCategorias();
    }
    
    // Limpa a tabela
    tbody.innerHTML = '';
    
    if (categorias.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="4" class="text-center">Nenhuma categoria cadastrada</td>';
        tbody.appendChild(tr);
        return;
    }
    
    // Adiciona cada categoria à tabela
    categorias.forEach(categoria => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${categoria.nome}</td>
            <td>${categoria.icone ? `<i class="${categoria.icone}"></i>` : '-'}</td>
            <td><span class="status-badge status-${categoria.status === 'ativo' ? 'active' : 'inactive'}">${categoria.status === 'ativo' ? 'Ativa' : 'Inativa'}</span></td>
            <td class="action-buttons">
                <button class="btn-action btn-edit-categoria" data-id="${categoria.id}" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="btn-action btn-delete-categoria" data-id="${categoria.id}" title="Excluir"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    // Adiciona os event listeners para os botões de ação
    adicionarEventListenersTabelaCategoria();
}

// Função para adicionar event listeners aos botões da tabela de categorias
function adicionarEventListenersTabelaCategoria() {
    // Botões de editar
    document.querySelectorAll('.btn-edit-categoria').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            abrirModalEditarCategoria(id);
        });
    });
    
    // Botões de excluir
    document.querySelectorAll('.btn-delete-categoria').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            confirmarExclusaoCategoria(id);
        });
    });
}

// Função para abrir o modal de edição de categoria
function abrirModalEditarCategoria(id) {
    const categoria = getCategoriaById(id);
    if (!categoria) return;
    
    // Preenche o formulário com os dados da categoria
    document.getElementById('modal-categoria-title').textContent = 'Editar Categoria';
    document.getElementById('categoria-id').value = categoria.id;
    document.getElementById('categoria-nome').value = categoria.nome || '';
    document.getElementById('categoria-icone').value = categoria.icone || '';
    
    // Define o status
    const statusAtivo = document.querySelector('input[name="categoria-status"][value="1"]');
    const statusInativo = document.querySelector('input[name="categoria-status"][value="0"]');
    
    if (statusAtivo && statusInativo) {
        if (categoria.status === 'ativo') {
            statusAtivo.checked = true;
        } else {
            statusInativo.checked = true;
        }
    }
    
    // Abre o modal
    const modal = document.getElementById('modal-categoria');
    modal.style.display = 'block';
}

// Função para abrir o modal para nova categoria
function abrirModalNovaCategoria() {
    // Limpa o formulário
    document.getElementById('modal-categoria-title').textContent = 'Nova Categoria';
    document.getElementById('categoria-id').value = '';
    document.getElementById('form-categoria').reset();
    
    // Seleciona o status ativo por padrão
    const statusAtivo = document.querySelector('input[name="categoria-status"][value="1"]');
    if (statusAtivo) {
        statusAtivo.checked = true;
    }
    
    // Abre o modal
    const modal = document.getElementById('modal-categoria');
    modal.style.display = 'block';
}

// Função para confirmar exclusão de categoria
function confirmarExclusaoCategoria(id) {
    const categoria = getCategoriaById(id);
    if (!categoria) return;
    
    if (confirm(`Deseja realmente excluir a categoria ${categoria.nome}?`)) {
        deleteCategoria(id);
        renderizarTabelaCategorias();
    }
}

// Função para salvar a categoria (nova ou edição)
function salvarCategoria(event) {
    event.preventDefault();
    
    const id = document.getElementById('categoria-id').value;
    const nome = document.getElementById('categoria-nome').value;
    const icone = document.getElementById('categoria-icone').value;
    
    let status = 'ativo';
    const statusInativo = document.querySelector('input[name="categoria-status"][value="0"]:checked');
    if (statusInativo) {
        status = 'inativo';
    }
    
    const categoria = {
        nome,
        icone,
        status
    };
    
    if (id) {
        // Atualização
        updateCategoria(id, categoria);
    } else {
        // Nova categoria
        addCategoria(categoria);
    }
    
    // Fecha o modal e atualiza a tabela
    fecharModalCategoria();
    renderizarTabelaCategorias();
}

// Função para fechar o modal de categoria
function fecharModalCategoria() {
    const modal = document.getElementById('modal-categoria');
    modal.style.display = 'none';
}

// ==================== GERENCIAMENTO DE PRODUTOS ====================

// Inicialização do banco de dados local para produtos
function initProdutosDatabase() {
    // Verifica se já existe a lista de produtos no localStorage
    if (!localStorage.getItem('produtos')) {
        // Inicializa com uma lista vazia
        localStorage.setItem('produtos', JSON.stringify([]));
    }
}

// Função para obter todos os produtos
function getProdutos() {
    return JSON.parse(localStorage.getItem('produtos') || '[]');
}

// Função para adicionar um novo produto
function addProduto(produto) {
    const produtos = getProdutos();
    
    // Gera um ID único para o produto
    produto.id = Date.now().toString();
    produto.status = produto.status || 'ativo';
    
    produtos.push(produto);
    localStorage.setItem('produtos', JSON.stringify(produtos));
    
    return produto;
}

// Função para atualizar um produto existente
function updateProduto(id, dadosAtualizados) {
    const produtos = getProdutos();
    const index = produtos.findIndex(p => p.id === id);
    
    if (index !== -1) {
        produtos[index] = { ...produtos[index], ...dadosAtualizados };
        localStorage.setItem('produtos', JSON.stringify(produtos));
        return produtos[index];
    }
    
    return null;
}

// Função para excluir um produto
function deleteProduto(id) {
    const produtos = getProdutos();
    const novaLista = produtos.filter(p => p.id !== id);
    
    localStorage.setItem('produtos', JSON.stringify(novaLista));
    return true;
}

// Função para buscar um produto pelo ID
function getProdutoById(id) {
    const produtos = getProdutos();
    return produtos.find(p => p.id === id) || null;
}

// Função para buscar produtos por nome ou código (pesquisa parcial)
function searchProdutos(termo) {
    if (!termo) return getProdutos();
    
    const produtos = getProdutos();
    const termoLower = termo.toLowerCase();
    
    return produtos.filter(p => 
        p.nome.toLowerCase().includes(termoLower) || 
        (p.codigo && p.codigo.toLowerCase().includes(termoLower))
    );
}

// Função para carregar as categorias no select do formulário de produto
function carregarCategoriasSelect() {
    const select = document.getElementById('produto-categoria');
    if (!select) return;
    
    // Limpa as opções existentes, mantendo apenas a primeira (placeholder)
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    // Obtém todas as categorias ativas
    const categorias = getCategorias().filter(c => c.status === 'ativo');
    
    // Adiciona cada categoria como uma opção
    categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.id;
        option.textContent = categoria.nome;
        select.appendChild(option);
    });
}

// Função para obter o nome da categoria pelo ID
function getNomeCategoria(categoriaId) {
    const categoria = getCategoriaById(categoriaId);
    return categoria ? categoria.nome : '-';
}

// Função para renderizar a tabela de produtos
function renderizarTabelaProdutos(produtos = null) {
    const tbody = document.querySelector('#produtos-table tbody');
    if (!tbody) return;
    
    // Se não for fornecida uma lista, busca todos
    if (produtos === null) {
        produtos = getProdutos();
    }
    
    // Limpa a tabela
    tbody.innerHTML = '';
    
    if (produtos.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="7" class="text-center">Nenhum produto cadastrado</td>';
        tbody.appendChild(tr);
        return;
    }
    
    // Adiciona cada produto à tabela
    produtos.forEach(produto => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${produto.nome}</td>
            <td>${produto.codigo || '-'}</td>
            <td>${getNomeCategoria(produto.categoriaId)}</td>
            <td>${produto.validadePadrao || '-'} dias</td>
            <td>${produto.statusPadrao || '-'}</td>
            <td><span class="status-badge status-${produto.status === 'ativo' ? 'active' : 'inactive'}">${produto.status === 'ativo' ? 'Ativo' : 'Inativo'}</span></td>
            <td class="action-buttons">
                <button class="btn-action btn-edit-produto" data-id="${produto.id}" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="btn-action btn-delete-produto" data-id="${produto.id}" title="Excluir"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    // Adiciona os event listeners para os botões de ação
    adicionarEventListenersTabelaProduto();
}

// Função para adicionar event listeners aos botões da tabela de produtos
function adicionarEventListenersTabelaProduto() {
    // Botões de editar
    document.querySelectorAll('.btn-edit-produto').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            abrirModalEditarProduto(id);
        });
    });
    
    // Botões de excluir
    document.querySelectorAll('.btn-delete-produto').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            confirmarExclusaoProduto(id);
        });
    });
}

// Função para abrir o modal de edição de produto
function abrirModalEditarProduto(id) {
    const produto = getProdutoById(id);
    if (!produto) return;
    
    // Carrega as categorias no select
    carregarCategoriasSelect();
    
    // Preenche o formulário com os dados do produto
    document.getElementById('modal-produto-title').textContent = 'Editar Produto';
    document.getElementById('produto-id').value = produto.id;
    document.getElementById('produto-nome').value = produto.nome || '';
    document.getElementById('produto-codigo').value = produto.codigo || '';
    document.getElementById('produto-categoria').value = produto.categoriaId || '';
    document.getElementById('produto-validade').value = produto.validadePadrao || '3';
    document.getElementById('produto-status-padrao').value = produto.statusPadrao || 'RESFRIADO';
    
    // Define o status
    const statusAtivo = document.querySelector('input[name="produto-status"][value="1"]');
    const statusInativo = document.querySelector('input[name="produto-status"][value="0"]');
    
    if (statusAtivo && statusInativo) {
        if (produto.status === 'ativo') {
            statusAtivo.checked = true;
        } else {
            statusInativo.checked = true;
        }
    }
    
    // Abre o modal
    const modal = document.getElementById('modal-produto');
    modal.style.display = 'block';
}

// Função para abrir o modal para novo produto
function abrirModalNovoProduto() {
    // Carrega as categorias no select
    carregarCategoriasSelect();
    
    // Limpa o formulário
    document.getElementById('modal-produto-title').textContent = 'Novo Produto';
    document.getElementById('produto-id').value = '';
    document.getElementById('form-produto').reset();
    
    // Seleciona o status ativo por padrão
    const statusAtivo = document.querySelector('input[name="produto-status"][value="1"]');
    if (statusAtivo) {
        statusAtivo.checked = true;
    }
    
    // Abre o modal
    const modal = document.getElementById('modal-produto');
    modal.style.display = 'block';
}

// Função para confirmar exclusão de produto
function confirmarExclusaoProduto(id) {
    const produto = getProdutoById(id);
    if (!produto) return;
    
    if (confirm(`Deseja realmente excluir o produto ${produto.nome}?`)) {
        deleteProduto(id);
        renderizarTabelaProdutos();
    }
}

// Função para salvar o produto (novo ou edição)
function salvarProduto(event) {
    event.preventDefault();
    
    const id = document.getElementById('produto-id').value;
    const nome = document.getElementById('produto-nome').value;
    const codigo = document.getElementById('produto-codigo').value;
    const categoriaId = document.getElementById('produto-categoria').value;
    const validadePadrao = document.getElementById('produto-validade').value;
    const statusPadrao = document.getElementById('produto-status-padrao').value;
    
    let status = 'ativo';
    const statusInativo = document.querySelector('input[name="produto-status"][value="0"]:checked');
    if (statusInativo) {
        status = 'inativo';
    }
    
    const produto = {
        nome,
        codigo,
        categoriaId,
        validadePadrao,
        statusPadrao,
        status
    };
    
    if (id) {
        // Atualização
        updateProduto(id, produto);
    } else {
        // Novo produto
        addProduto(produto);
    }
    
    // Fecha o modal e atualiza a tabela
    fecharModalProduto();
    renderizarTabelaProdutos();
}

// Função para fechar o modal de produto
function fecharModalProduto() {
    const modal = document.getElementById('modal-produto');
    modal.style.display = 'none';
}

// ==================== INICIALIZAÇÃO E EVENT LISTENERS ====================

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa os bancos de dados locais
    initCategoriasDatabase();
    initProdutosDatabase();
    
    // Configuração da navegação entre seções
    const navLinks = {
        'nav-funcionarios': 'funcionarios-section',
        'nav-categorias': 'categorias-section',
        'nav-produtos': 'produtos-section',
        'nav-estoque': 'estoque-section',
        'nav-perdas': 'perdas-section',
        'nav-relatorios': 'relatorios-section'
    };
    
    // Adiciona event listeners para os links de navegação
    Object.keys(navLinks).forEach(navId => {
        const navElement = document.getElementById(navId);
        if (navElement) {
            navElement.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Esconde todas as seções
                document.querySelectorAll('.content-section').forEach(section => {
                    section.style.display = 'none';
                });
                
                // Remove a classe 'active' de todos os links
                document.querySelectorAll('.menu li').forEach(item => {
                    item.classList.remove('active');
                });
                
                // Mostra a seção correspondente
                const sectionId = navLinks[navId];
                const section = document.getElementById(sectionId);
                if (section) {
                    section.style.display = 'block';
                }
                
                // Adiciona a classe 'active' ao link clicado
                navElement.classList.add('active');
                
                // Renderiza a tabela correspondente
                if (navId === 'nav-categorias') {
                    renderizarTabelaCategorias();
                } else if (navId === 'nav-produtos') {
                    renderizarTabelaProdutos();
                }
            });
        }
    });
    
    // Event listeners para categorias
    const btnNovaCategoria = document.getElementById('btn-nova-categoria');
    if (btnNovaCategoria) {
        btnNovaCategoria.addEventListener('click', abrirModalNovaCategoria);
    }
    
    const formCategoria = document.getElementById('form-categoria');
    if (formCategoria) {
        formCategoria.addEventListener('submit', salvarCategoria);
    }
    
    const btnCancelarCategoria = document.getElementById('btn-cancelar-categoria');
    if (btnCancelarCategoria) {
        btnCancelarCategoria.addEventListener('click', fecharModalCategoria);
    }
    
    // Event listeners para produtos
    const btnNovoProduto = document.getElementById('btn-novo-produto');
    if (btnNovoProduto) {
        btnNovoProduto.addEventListener('click', abrirModalNovoProduto);
    }
    
    const formProduto = document.getElementById('form-produto');
    if (formProduto) {
        formProduto.addEventListener('submit', salvarProduto);
    }
    
    const btnCancelarProduto = document.getElementById('btn-cancelar-produto');
    if (btnCancelarProduto) {
        btnCancelarProduto.addEventListener('click', fecharModalProduto);
    }
    
    // Event listener para o campo de busca de categorias
    const searchCategoriaInput = document.getElementById('search-categoria-input');
    if (searchCategoriaInput) {
        searchCategoriaInput.addEventListener('input', () => {
            const termo = searchCategoriaInput.value.trim();
            const resultados = searchCategorias(termo);
            renderizarTabelaCategorias(resultados);
        });
    }
    
    // Event listener para o campo de busca de produtos
    const searchProdutoInput = document.getElementById('search-produto-input');
    if (searchProdutoInput) {
        searchProdutoInput.addEventListener('input', () => {
            const termo = searchProdutoInput.value.trim();
            const resultados = searchProdutos(termo);
            renderizarTabelaProdutos(resultados);
        });
    }
    
    // Fecha os modais se clicar fora deles
    window.addEventListener('click', (event) => {
        const modalCategoria = document.getElementById('modal-categoria');
        if (event.target === modalCategoria) {
            fecharModalCategoria();
        }
        
        const modalProduto = document.getElementById('modal-produto');
        if (event.target === modalProduto) {
            fecharModalProduto();
        }
    });
    
    // Adiciona event listeners para os botões de fechar modais
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            const modal = closeBtn.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
});