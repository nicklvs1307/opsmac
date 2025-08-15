/**
 * filtro-etiquetas.js - Implementação do filtro de etiquetas para o Etiquetafy
 * Este script implementa as funcionalidades de filtragem de etiquetas por data de validade,
 * grupos, métodos e status
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
    // Cria o modal de filtro
    criarModalFiltro();
    
    // Adiciona o evento de clique ao botão de filtro
    const btnFiltrarEtiquetas = document.getElementById('btn-filtrar-etiquetas');
    if (btnFiltrarEtiquetas) {
        btnFiltrarEtiquetas.addEventListener('click', abrirModalFiltro);
    }
}

/**
 * Cria o modal de filtro de etiquetas
 */
function criarModalFiltro() {
    // Verifica se o modal já existe
    if (document.getElementById('filtro-etiquetas-modal')) {
        return;
    }
    
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
                    
                    <div class="filter-section">
                        <h4 class="filter-title">Data de validade<i class="fas fa-chevron-down"></i></h4>
                        <div class="filter-options">
                            <button class="filter-option" data-filter="data-validade" data-value="vencidos">Vencidos</button>
                            <button class="filter-option" data-filter="data-validade" data-value="hoje">Hoje</button>
                            <button class="filter-option" data-filter="data-validade" data-value="amanha">Amanhã</button>
                            <button class="filter-option" data-filter="data-validade" data-value="personalizado">Personalizado</button>
                        </div>
                    </div>
                    
                    <div class="filter-section">
                        <h4 class="filter-title">Grupos<span class="filter-count">(0)</span><i class="fas fa-chevron-down"></i></h4>
                        <div class="filter-options">
                            <button class="filter-option" data-filter="grupo" data-value="todos">Todos</button>
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
                    
                    <div class="filter-section">
                        <h4 class="filter-title">Métodos<span class="filter-count">(0)</span><i class="fas fa-chevron-down"></i></h4>
                        <div class="filter-options">
                            <button class="filter-option" data-filter="metodo" data-value="todos">Todos</button>
                            <button class="filter-option" data-filter="metodo" data-value="resfriado"><i class="fas fa-snowflake"></i> Resfriado</button>
                            <button class="filter-option" data-filter="metodo" data-value="congelado"><i class="fas fa-icicles"></i> Congelado</button>
                            <button class="filter-option" data-filter="metodo" data-value="temp-ambiente"><i class="fas fa-temperature-low"></i> Temp. Ambiente</button>
                            <button class="filter-option" data-filter="metodo" data-value="quente"><i class="fas fa-fire"></i> Quente</button>
                        </div>
                    </div>
                    
                    <div class="filter-section">
                        <h4 class="filter-title">Status<span class="filter-count">(0)</span><i class="fas fa-chevron-down"></i></h4>
                        <div class="filter-options">
                            <button class="filter-option" data-filter="status" data-value="todos">Todos</button>
                            <button class="filter-option" data-filter="status" data-value="aberto">Aberto</button>
                            <button class="filter-option" data-filter="status" data-value="amostra">Amostra</button>
                            <button class="filter-option" data-filter="status" data-value="descongelando">Descongelando</button>
                            <button class="filter-option" data-filter="status" data-value="prato-quente">Prato Quente</button>
                            <button class="filter-option" data-filter="status" data-value="prato-frio">Prato Frio</button>
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
    
    // Títulos das seções de filtro (para expandir/colapsar)
    const filterTitles = modal.querySelectorAll('.filter-title');
    filterTitles.forEach(title => {
        title.addEventListener('click', toggleFilterSection);
    });
}

/**
 * Abre o modal de filtro de etiquetas
 */
function abrirModalFiltro() {
    const modal = document.getElementById('filtro-etiquetas-modal');
    if (modal) {
        modal.style.display = 'block';
        
        // Atualiza a interface com os filtros ativos
        atualizarInterfaceFiltros();
    }
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
}

/**
 * Expande ou colapsa uma seção de filtro
 */
function toggleFilterSection(event) {
    const title = event.currentTarget;
    const section = title.closest('.filter-section');
    const options = section.querySelector('.filter-options');
    
    // Toggle da classe 'collapsed'
    section.classList.toggle('collapsed');
    
    // Atualiza o ícone
    const icon = title.querySelector('i');
    if (section.classList.contains('collapsed')) {
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-right');
        options.style.display = 'none';
    } else {
        icon.classList.remove('fa-chevron-right');
        icon.classList.add('fa-chevron-down');
        options.style.display = 'flex';
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
    
    // Atualiza o contador de filtros ativos
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
    
    // Atualiza o contador de filtros ativos
    atualizarContadorFiltros();
}

/**
 * Atualiza a interface com os filtros ativos
 */
function atualizarInterfaceFiltros() {
    // Para cada filtro ativo, seleciona a opção correspondente
    Object.keys(filtrosAtivos).forEach(filter => {
        const value = filtrosAtivos[filter];
        
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
    });
}

/**
 * Atualiza o contador de filtros ativos
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
    const btnFiltrarEtiquetas = document.getElementById('btn-filtrar-etiquetas');
    if (btnFiltrarEtiquetas) {
        if (count > 0) {
            btnFiltrarEtiquetas.textContent = `Filtros (${count})`;
            btnFiltrarEtiquetas.classList.add('has-filters');
        } else {
            btnFiltrarEtiquetas.textContent = 'Filtrar';
            btnFiltrarEtiquetas.classList.remove('has-filters');
        }
    }
    
    // Atualiza os contadores nas seções de filtro
    const filterCounts = document.querySelectorAll('.filter-count');
    filterCounts.forEach(countElement => {
        const section = countElement.closest('.filter-section');
        const filter = section.querySelector('.filter-option').dataset.filter;
        
        if (filtrosAtivos[filter] !== null) {
            countElement.textContent = '(1)';
        } else {
            countElement.textContent = '(0)';
        }
    });
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
            // Caso 'personalizado' será implementado posteriormente
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