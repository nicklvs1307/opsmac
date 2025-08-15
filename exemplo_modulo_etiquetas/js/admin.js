/**
 * admin.js - Gerenciamento de funcionários para o Etiquetafy
 * Este script implementa as funcionalidades de CRUD para funcionários
 * utilizando localStorage como banco de dados local
 */

// Inicialização do banco de dados local
function initDatabase() {
    // Verifica se já existe a lista de funcionários no localStorage
    if (!localStorage.getItem('funcionarios')) {
        // Inicializa com uma lista vazia
        localStorage.setItem('funcionarios', JSON.stringify([]));
    }
}

// Função para obter todos os funcionários
function getFuncionarios() {
    return JSON.parse(localStorage.getItem('funcionarios') || '[]');
}

// Função para adicionar um novo funcionário
function addFuncionario(funcionario) {
    const funcionarios = getFuncionarios();
    
    // Gera um ID único para o funcionário
    funcionario.id = Date.now().toString();
    funcionario.status = funcionario.status || 'ativo';
    
    funcionarios.push(funcionario);
    localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
    
    return funcionario;
}

// Função para atualizar um funcionário existente
function updateFuncionario(id, dadosAtualizados) {
    const funcionarios = getFuncionarios();
    const index = funcionarios.findIndex(f => f.id === id);
    
    if (index !== -1) {
        funcionarios[index] = { ...funcionarios[index], ...dadosAtualizados };
        localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
        return funcionarios[index];
    }
    
    return null;
}

// Função para excluir um funcionário
function deleteFuncionario(id) {
    const funcionarios = getFuncionarios();
    const novaLista = funcionarios.filter(f => f.id !== id);
    
    localStorage.setItem('funcionarios', JSON.stringify(novaLista));
    return true;
}

// Função para buscar um funcionário pelo ID
function getFuncionarioById(id) {
    const funcionarios = getFuncionarios();
    return funcionarios.find(f => f.id === id) || null;
}

// Função para buscar funcionários por nome (pesquisa parcial)
function searchFuncionarios(termo) {
    if (!termo) return getFuncionarios();
    
    const funcionarios = getFuncionarios();
    const termoLower = termo.toLowerCase();
    
    return funcionarios.filter(f => 
        f.nome.toLowerCase().includes(termoLower) || 
        (f.cargo && f.cargo.toLowerCase().includes(termoLower))
    );
}

// Função para renderizar a tabela de funcionários
function renderizarTabelaFuncionarios(funcionarios = null) {
    const tbody = document.querySelector('#funcionarios-table tbody');
    if (!tbody) return;
    
    // Se não for fornecida uma lista, busca todos
    if (funcionarios === null) {
        funcionarios = getFuncionarios();
    }
    
    // Limpa a tabela
    tbody.innerHTML = '';
    
    if (funcionarios.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="6" class="text-center">Nenhum funcionário cadastrado</td>';
        tbody.appendChild(tr);
        return;
    }
    
    // Adiciona cada funcionário à tabela
    funcionarios.forEach(funcionario => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${funcionario.nome}</td>
            <td>${funcionario.cargo || '-'}</td>
            <td>${funcionario.email || '-'}</td>
            <td>${funcionario.telefone || '-'}</td>
            <td><span class="status-badge status-${funcionario.status === 'ativo' ? 'active' : 'inactive'}">${funcionario.status === 'ativo' ? 'Ativo' : 'Inativo'}</span></td>
            <td class="action-buttons">
                <button class="btn-action btn-edit" data-id="${funcionario.id}" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="btn-action btn-delete" data-id="${funcionario.id}" title="Excluir"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    // Adiciona os event listeners para os botões de ação
    adicionarEventListenersTabela();
}

// Função para adicionar event listeners aos botões da tabela
function adicionarEventListenersTabela() {
    // Botões de editar
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            abrirModalEditar(id);
        });
    });
    
    // Botões de excluir
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            confirmarExclusao(id);
        });
    });
}

// Função para abrir o modal de edição
function abrirModalEditar(id) {
    const funcionario = getFuncionarioById(id);
    if (!funcionario) return;
    
    // Preenche o formulário com os dados do funcionário
    document.getElementById('modal-funcionario-title').textContent = 'Editar Funcionário';
    document.getElementById('funcionario-id').value = funcionario.id;
    document.getElementById('funcionario-nome').value = funcionario.nome || '';
    document.getElementById('funcionario-cargo').value = funcionario.cargo || '';
    document.getElementById('funcionario-email').value = funcionario.email || '';
    document.getElementById('funcionario-telefone').value = funcionario.telefone || '';
    
    const statusAtivo = document.getElementById('funcionario-status-ativo');
    const statusInativo = document.getElementById('funcionario-status-inativo');
    
    if (statusAtivo && statusInativo) {
        if (funcionario.status === 'ativo') {
            statusAtivo.checked = true;
        } else {
            statusInativo.checked = true;
        }
    }
    
    // Abre o modal
    const modal = document.getElementById('modal-funcionario');
    modal.style.display = 'block';
}

// Função para abrir o modal para novo funcionário
function abrirModalNovo() {
    // Limpa o formulário
    document.getElementById('modal-funcionario-title').textContent = 'Novo Funcionário';
    document.getElementById('funcionario-id').value = '';
    document.getElementById('form-funcionario').reset();
    
    // Seleciona o status ativo por padrão
    const statusAtivo = document.getElementById('funcionario-status-ativo');
    if (statusAtivo) {
        statusAtivo.checked = true;
    }
    
    // Abre o modal
    const modal = document.getElementById('modal-funcionario');
    modal.style.display = 'block';
}

// Função para confirmar exclusão
function confirmarExclusao(id) {
    const funcionario = getFuncionarioById(id);
    if (!funcionario) return;
    
    if (confirm(`Deseja realmente excluir o funcionário ${funcionario.nome}?`)) {
        deleteFuncionario(id);
        renderizarTabelaFuncionarios();
    }
}

// Função para salvar o funcionário (novo ou edição)
function salvarFuncionario(event) {
    event.preventDefault();
    
    const id = document.getElementById('funcionario-id').value;
    const nome = document.getElementById('funcionario-nome').value;
    const cargo = document.getElementById('funcionario-cargo').value;
    const email = document.getElementById('funcionario-email').value;
    const telefone = document.getElementById('funcionario-telefone').value;
    
    let status = 'ativo';
    const statusInativo = document.getElementById('funcionario-status-inativo');
    if (statusInativo && statusInativo.checked) {
        status = 'inativo';
    }
    
    const funcionario = {
        nome,
        cargo,
        email,
        telefone,
        status
    };
    
    if (id) {
        // Atualização
        updateFuncionario(id, funcionario);
    } else {
        // Novo funcionário
        addFuncionario(funcionario);
    }
    
    // Fecha o modal e atualiza a tabela
    fecharModal();
    renderizarTabelaFuncionarios();
}

// Função para fechar o modal
function fecharModal() {
    const modal = document.getElementById('modal-funcionario');
    modal.style.display = 'none';
}

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa o banco de dados local
    initDatabase();
    
    // Renderiza a tabela inicial
    renderizarTabelaFuncionarios();
    
    // Event listener para o botão de novo funcionário
    const btnNovoFuncionario = document.getElementById('btn-novo-funcionario');
    if (btnNovoFuncionario) {
        btnNovoFuncionario.addEventListener('click', abrirModalNovo);
    }
    
    // Event listener para o formulário
    const formFuncionario = document.getElementById('form-funcionario');
    if (formFuncionario) {
        formFuncionario.addEventListener('submit', salvarFuncionario);
    }
    
    // Event listener para fechar o modal
    const closeModal = document.querySelector('.close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', fecharModal);
    }
    
    // Event listener para o campo de busca
    const searchInput = document.getElementById('search-funcionario-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const termo = searchInput.value.trim();
            const resultados = searchFuncionarios(termo);
            renderizarTabelaFuncionarios(resultados);
        });
    }
    
    // Fecha o modal se clicar fora dele
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('modal-funcionario');
        if (event.target === modal) {
            fecharModal();
        }
    });
});