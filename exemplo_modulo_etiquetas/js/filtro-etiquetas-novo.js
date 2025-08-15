/**
 * filtro-etiquetas-novo.js - Implementação do novo filtro de etiquetas para o Etiquetafy
 * Este script implementa as funcionalidades de filtragem de etiquetas por data de validade,
 * grupos, métodos e status com uma interface moderna
 */

// Variáveis para armazenar os filtros selecionados
let filtrosAtivos = {
    dataValidade: null,
    grupo: null,
    metodo: null,
    status: null
};

/**
 * Inicializa o modal de filtro de etiquetas
 */
function initFiltroEtiquetas() {
    // Adiciona o evento de clique ao botão de filtro
    const btnFiltrarEtiquetas = document.getElementById('btn-filtros-validade');
    if (btnFiltrarEtiquetas) {
        btnFiltrarEtiquetas.addEventListener('click', abrirModalFiltro);
    }
}

/**
 * Abre o modal de filtro de etiquetas
 */
function abrirModalFiltro() {
    // Cria o modal se ele não existir
    if (!document.getElementById('filtro-etiquetas-modal')) {
        criarModalFiltro();
    }
    
    const modal = document.getElementById('filtro-etiquetas-modal');
    if (modal) {
        modal.style.display = 'block';
        
        // Atualiza a interface com os filtros ativos
        atualizarInterfaceFiltros();
    }
}

/**
 * Cria o modal de filtro de etiquetas com o novo design
 */
function criarModalFiltro() {
    // Cria o elemento do modal
    const modalHTML = `
        <div class="modal" id="filtro-etiquetas-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Filtrar etiquetas</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Filtre as etiquetas por data de validade, grupos ou métodos.</p>
                    
                    <!-- Grupos -->
                    <div class="filter-section">
                        <div class="filter-options grupos-filter">
                            <button class="filter-option selected" data-filter="grupo" data-value="todos">Todos</button>
                            <button class="filter-option" data-filter="grupo" data-value="proteinas">Proteínas</button>
                            <button class="filter-option" data-filter="grupo" data-value="hortifruti">Hortifruti</button>
                            <button class="filter-option" data-filter="grupo" data-value="laticinios">Laticínios</button>
                            <button class="filter-option" data-filter="grupo" data-value="secos">Secos</button>
                            <button class="filter-option" data-filter="grupo" data-value="bar">Bar</button>
                            <button class="filter-option" data-filter="grupo" data-value="confeitaria">Confeitaria</button>
                            <button class="filter-option" data-filter="grupo" data-value="padaria">Padaria</button>
                            <button class="filter-option" data-filter="grupo" data-value="queijos">Queijos</button>
                            <button class="filter-option" data-filter="grupo" data-value="processados">Processados</button>
                        </div>
                    </div>
                    
                    <!-- Métodos -->
                    <div class="filter-section">
                        <h4 class="filter-title">Métodos<span class="filter-count">(0)</span></h4>
                        <div class="filter-options metodos-filter">
                            <button class="filter-option selected" data-filter="metodo" data-value="todos">Todos</button>
                            <button class="filter-option" data-filter="metodo" data-value="resfriado"><i class="fas fa-snowflake"></i> Resfriado</button>
                            <button class="filter-option" data-filter="metodo" data-value="congelado"><i class="fas fa-icicles"></i> Congelado</button>
                            <button class="filter-option" data-filter="metodo" data-value="temp-ambiente"><i class="fas fa-temperature-low"></i> Temp. Ambiente</button>
                            <button class="filter-option" data-filter="metodo" data-value="quente"><i class="fas fa-fire"></i> Quente</button>
                        </div>
                    </div>
                    
                    <!-- Status -->
                    <div class="filter-section">
                        <h4 class="filter-title">Status<span class="filter-count">(0)</span></h4>
                        <div class="filter-options status-filter">
                            <button class="filter-option selected" data-filter="status" data-value="todos">Todos</button>
                            <button class="filter-option" data-filter="status" data-value="aberto">Aberto</button>
                            <button class="filter-option" data-filter="status" data-value="amostra">Amostra</button>
                            <button class="filter-option" data-filter="status" data-value="descongelando">Descongelando</button>
                            <button class="filter-option" data-filter="status" data-value="prato-quente">Pista Quente</button>
                            <button class="filter-option" data-filter="status" data-value="prato-frio">Pista Fria</button>
                        </div>
                    </div>
                    
                    <div class="filter-actions">
                        <button id="aplicar-filtro" class="btn btn-primary">Aplicar</button>
                        <button id="limpar-filtros" class="btn btn-secondary">Limpar todos</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Adiciona o modal ao corpo do documento
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstElementChild);
    
    // Adiciona os eventos aos botões do modal
    const modal = document.getElementById('filtro-etiquetas-modal');
    
    // Botão de fechar
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', fecharModalFiltro);
    
    // Botões de opções de filtro
    const filterOptions = modal.querySelectorAll('.filter-option');
    filterOptions.forEach(option => {
        option.addEventListener('click', selecionarOpcaoFiltro);
    });
    
    // Botão de aplicar filtro
    const aplicarBtn = document.getElementById('aplicar-filtro');
    aplicarBtn.addEventListener('click', aplicarFiltros);
    
    // Botão de limpar filtros
    const limparBtn = document.getElementById('limpar-filtros');
    limparBtn.addEventListener('click', limparFiltros);
    
    // Adiciona estilos CSS específicos para o novo modal
    adicionarEstilosModal();
}

/**
 * Adiciona estilos CSS específicos para o novo modal de filtro
 */
function adicionarEstilosModal() {
    // Verifica se os estilos já foram adicionados
    if (document.getElementById('filtro-etiquetas-styles')) {
        return;
    }
    
    const styleElement = document.createElement('style');
    styleElement.id = 'filtro-etiquetas-styles';
    styleElement.textContent = `
        #filtro-etiquetas-modal .modal-content {
            max-width: 600px;
            border-radius: 8px;
        }
        
        #filtro-etiquetas-modal .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            border-bottom: 1px solid #eee;
        }
        
        #filtro-etiquetas-modal .modal-header h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
        }
        
        #filtro-etiquetas-modal .close-modal {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #888;
        }
        
        #filtro-etiquetas-modal .modal-body {
            padding: 20px;
        }
        
        #filtro-etiquetas-modal .filter-section {
            margin-bottom: 20px;
        }
        
        #filtro-etiquetas-modal .filter-title {
            margin: 0 0 10px 0;
            font-size: 16px;
            font-weight: 500;
            display: flex;
            align-items: center;
        }
        
        #filtro-etiquetas-modal .filter-count {
            margin-left: 5px;
            font-size: 14px;
            color: #888;
        }
        
        #filtro-etiquetas-modal .filter-options {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 15px;
        }
        
        #filtro-etiquetas-modal .filter-option {
            background-color: #f5f5f5;
            border: none;
            border-radius: 4px;
            padding: 8px 15px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        #filtro-etiquetas-modal .filter-option:hover {
            background-color: #e9e9e9;
        }
        
        #filtro-etiquetas-modal .filter-option.selected {
            background-color: #ff5252;
            color: white;
        }
        
        #filtro-etiquetas-modal .filter-actions {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #eee;
        }
        
        #filtro-etiquetas-modal .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        #filtro-etiquetas-modal .btn-primary {
            background-color: #ff5252;
            color: white;
            flex-grow: 1;
        }
        
        #filtro-etiquetas-modal .btn-secondary {
            background-color: #f5f5f5;
            color: #333;
        }
        
        #filtro-etiquetas-modal .btn-primary:hover {
            background-color: #ff3838;
        }
        
        #filtro-etiquetas-modal .btn-secondary:hover {
            background-color: #e9e9e9;
        }
    `;
    
    document.head.appendChild(styleElement);
}

/**
 * Fecha o modal de filtro de etiquetas
 */
function fecharModalFiltro() {
    const modal = document.getElementById('filtro-etiquetas-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Seleciona uma opção de filtro
 */
function selecionarOpcaoFiltro(event) {
    const option = event.currentTarget;
    const filter = option.dataset.filter;
    const value = option.dataset.value;
    
    // Remove a classe 'selected' de todas as opções do mesmo filtro
    const filterOptions = document.querySelectorAll(`.filter-option[data-filter="${filter}"]`);
    filterOptions.forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Adiciona a classe 'selected' à opção clicada
    option.classList.add('selected');
    
    // Atualiza o objeto de filtros ativos
    if (value === 'todos') {
        filtrosAtivos[filter] = null;
    } else {
        filtrosAtivos[filter] = value;
    }
    
    // Atualiza o contador na seção de filtro
    atualizarContadorFiltro(filter);
}

/**
 * Atualiza o contador em uma seção de filtro específica
 */
function atualizarContadorFiltro(filter) {
    const filterSection = document.querySelector(`.filter-section:has(.filter-option[data-filter="${filter}"])`);
    if (!filterSection) return;
    
    const countElement = filterSection.querySelector('.filter-count');
    if (!countElement) return;
    
    if (filtrosAtivos[filter] !== null) {
        countElement.textContent = '(1)';
    } else {
        countElement.textContent = '(0)';
    }
}

/**
 * Aplica os filtros selecionados
 */
function aplicarFiltros() {
    // Fecha o modal
    fecharModalFiltro();
    
    // Filtra as etiquetas com base nos filtros selecionados
    filtrarEtiquetas();
    
    // Atualiza o contador de filtros ativos no botão
    atualizarContadorFiltros();
}

/**
 * Limpa todos os filtros
 */
function limparFiltros() {
    // Reseta o objeto de filtros ativos
    filtrosAtivos = {
        dataValidade: null,
        grupo: null,
        metodo: null,
        status: null
    };
    
    // Remove a classe 'selected' de todas as opções, exceto as 'todos'
    const allOptions = document.querySelectorAll('.filter-option');
    allOptions.forEach(opt => {
        opt.classList.remove('selected');
        
        // Seleciona as opções 'todos'
        if (opt.dataset.value === 'todos') {
            opt.classList.add('selected');
        }
    });
    
    // Atualiza os contadores nas seções de filtro
    const filterCounts = document.querySelectorAll('.filter-count');
    filterCounts.forEach(countElement => {
        countElement.textContent = '(0)';
    });
}

/**
 * Atualiza a interface com os filtros ativos
 */
function atualizarInterfaceFiltros() {
    // Para cada filtro ativo, seleciona a opção correspondente
    Object.keys(filtrosAtivos).forEach(filter => {
        const value = filtrosAtivos[filter];
        
        // Remove a classe 'selected' de todas as opções do filtro
        const filterOptions = document.querySelectorAll(`.filter-option[data-filter="${filter}"]`);
        filterOptions.forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Se o valor for null, seleciona a opção 'todos'
        if (value === null) {
            const todosOption = document.querySelector(`.filter-option[data-filter="${filter}"][data-value="todos"]`);
            if (todosOption) {
                todosOption.classList.add('selected');
            }
        } else {
            // Seleciona a opção com o valor específico
            const option = document.querySelector(`.filter-option[data-filter="${filter}"][data-value="${value}"]`);
            if (option) {
                option.classList.add('selected');
            }
        }
        
        // Atualiza o contador na seção de filtro
        atualizarContadorFiltro(filter);
    });
}

/**
 * Atualiza o contador de filtros ativos no botão de filtro
 */
function atualizarContadorFiltros() {
    // Conta quantos filtros estão ativos
    let count = 0;
    Object.values(filtrosAtivos).forEach(value => {
        if (value !== null) {
            count++;
        }
    });
    
    // Atualiza o texto do botão de filtro
    const btnFiltrarEtiquetas = document.getElementById('btn-filtros-validade');
    if (btnFiltrarEtiquetas) {
        if (count > 0) {
            btnFiltrarEtiquetas.textContent = `Filtros (${count})`;
            btnFiltrarEtiquetas.classList.add('has-filters');
        } else {
            btnFiltrarEtiquetas.innerHTML = '<i class="icon-filter"></i> Filtros';
            btnFiltrarEtiquetas.classList.remove('has-filters');
        }
    }
}

/**
 * Filtra as etiquetas com base nos filtros selecionados
 */
function filtrarEtiquetas() {
    // Obtém todas as etiquetas
    let etiquetas = getEtiquetas();
    
    // Filtra por data de validade
    if (filtrosAtivos.dataValidade) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        const amanha = new Date(hoje);
        amanha.setDate(amanha.getDate() + 1);
        
        switch (filtrosAtivos.dataValidade) {
            case 'vencidos':
                etiquetas = etiquetas.filter(e => {
                    const dataValidade = new Date(e.dataValidade);
                    return dataValidade < hoje;
                });
                break;
            case 'hoje':
                etiquetas = etiquetas.filter(e => {
                    const dataValidade = new Date(e.dataValidade);
                    dataValidade.setHours(0, 0, 0, 0);
                    return dataValidade.getTime() === hoje.getTime();
                });
                break;
            case 'amanha':
                etiquetas = etiquetas.filter(e => {
                    const dataValidade = new Date(e.dataValidade);
                    dataValidade.setHours(0, 0, 0, 0);
                    return dataValidade.getTime() === amanha.getTime();
                });
                break;
        }
    }
    
    // Filtra por grupo
    if (filtrosAtivos.grupo) {
        etiquetas = etiquetas.filter(e => {
            return e.produto && e.produto.grupo && 
                   e.produto.grupo.toLowerCase() === filtrosAtivos.grupo.toLowerCase();
        });
    }
    
    // Filtra por método
    if (filtrosAtivos.metodo) {
        etiquetas = etiquetas.filter(e => {
            return e.produto && e.produto.metodo && 
                   e.produto.metodo.toLowerCase() === filtrosAtivos.metodo.toLowerCase();
        });
    }
    
    // Filtra por status
    if (filtrosAtivos.status) {
        etiquetas = etiquetas.filter(e => {
            return e.status && e.status.toLowerCase() === filtrosAtivos.status.toLowerCase();
        });
    }
    
    // Atualiza a exibição das etiquetas
    atualizarExibicaoEtiquetas(etiquetas);
}

/**
 * Atualiza a exibição das etiquetas filtradas
 */
function atualizarExibicaoEtiquetas(etiquetas) {
    // Implementação depende da estrutura da página
    // Esta função deve ser adaptada conforme necessário
    
    // Exemplo: atualiza uma tabela de etiquetas
    const tbody = document.querySelector('#etiquetas-table tbody');
    if (tbody) {
        tbody.innerHTML = '';
        
        if (etiquetas.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="6" class="text-center">Nenhuma etiqueta encontrada</td>';
            tbody.appendChild(tr);
            return;
        }
        
        etiquetas.forEach(etiqueta => {
            const tr = document.createElement('tr');
            
            // Formata a data de validade
            const dataValidade = new Date(etiqueta.dataValidade);
            const dataFormatada = `${dataValidade.getDate().toString().padStart(2, '0')}/${(dataValidade.getMonth() + 1).toString().padStart(2, '0')}/${dataValidade.getFullYear()}`;
            
            tr.innerHTML = `
                <td>${etiqueta.produto ? etiqueta.produto.nome : 'Produto não encontrado'}</td>
                <td>${dataFormatada}</td>
                <td>${etiqueta.responsavel ? etiqueta.responsavel.nome : '-'}</td>
                <td>${etiqueta.status || '-'}</td>
                <td class="action-buttons">
                    <button class="btn-action btn-delete-etiqueta" data-id="${etiqueta.id}" title="Excluir"><i class="fas fa-trash"></i></button>
                </td>
            `;
            
            tbody.appendChild(tr);
        });
        
        // Adiciona eventos aos botões de excluir
        const deleteButtons = document.querySelectorAll('.btn-delete-etiqueta');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const id = this.dataset.id;
                excluirEtiqueta(id);
            });
        });
    }
}

/**
 * Exclui uma etiqueta específica
 */
function excluirEtiqueta(id) {
    // Confirma a exclusão
    if (confirm('Deseja realmente excluir esta etiqueta?')) {
        // Chama a função de exclusão do etiqueta-manager.js
        deleteEtiqueta(id);
        
        // Atualiza a exibição
        filtrarEtiquetas();
        
        // Exibe mensagem de sucesso
        mostrarMensagemSucesso('Etiqueta excluída com sucesso!');
    }
}

// Inicializa o filtro de etiquetas quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    initFiltroEtiquetas();
});