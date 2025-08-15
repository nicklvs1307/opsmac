/**
 * etiquetas-tabela.js - Implementação da tabela de etiquetas para visualização e exclusão
 * Este script implementa a exibição de todas as etiquetas em formato de tabela
 * com funcionalidade de exclusão individual
 */

// Função para inicializar a tabela de etiquetas
function initEtiquetasTabela() {
    // Cria o container para a tabela se não existir
    let tabelaContainer = document.querySelector('#monitoria-validades-section .etiquetas-tabela-container');
    
    if (!tabelaContainer) {
        tabelaContainer = document.createElement('div');
        tabelaContainer.className = 'etiquetas-tabela-container';
        
        // Adiciona o container após os cards de validade
        const validadeCards = document.querySelector('#monitoria-validades-section .validade-summary-cards');
        if (validadeCards) {
            validadeCards.parentNode.insertBefore(tabelaContainer, validadeCards.nextSibling);
        } else {
            document.querySelector('#monitoria-validades-section').appendChild(tabelaContainer);
        }
    }
    
    // Adiciona estilos para a tabela
    const style = document.createElement('style');
    style.textContent = `
        .etiquetas-tabela-container {
            margin-top: 20px;
            overflow-x: auto;
        }
        
        .etiquetas-tabela {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            background-color: #fff;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            border-radius: 8px;
        }
        
        .etiquetas-tabela th,
        .etiquetas-tabela td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        
        .etiquetas-tabela th {
            background-color: #f8f9fa;
            font-weight: 600;
            color: #333;
        }
        
        .etiquetas-tabela tr:last-child td {
            border-bottom: none;
        }
        
        .etiquetas-tabela tr:hover {
            background-color: #f5f5f5;
        }
        
        .btn-excluir-etiqueta {
            background-color: #E53E3E;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s;
        }
        
        .btn-excluir-etiqueta:hover {
            background-color: #C53030;
        }
        
        .etiqueta-vencida {
            color: #E53E3E;
            font-weight: 500;
        }
        
        .etiqueta-hoje {
            color: #DD6B20;
            font-weight: 500;
        }
        
        .etiqueta-futura {
            color: #38A169;
            font-weight: 500;
        }
        
        .etiquetas-filtro {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            gap: 10px;
        }
        
        .etiquetas-filtro select {
            padding: 8px 12px;
            border-radius: 4px;
            border: 1px solid #ddd;
            background-color: #fff;
        }
        
        .etiquetas-filtro .btn-filtrar {
            background-color: #4299E1;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 4px;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);
    
    // Adiciona o filtro de etiquetas
    adicionarFiltroEtiquetas(tabelaContainer);
    
    // Carrega as etiquetas quando a seção for exibida
    const navValidades = document.getElementById('nav-validades');
    if (navValidades) {
        navValidades.addEventListener('click', function() {
            carregarTabelaEtiquetas();
        });
    }
    
    // Também carrega quando o botão de exclusão for clicado
    const btnExclusaoEtiquetas = document.getElementById('btn-exclusao-etiquetas');
    if (btnExclusaoEtiquetas) {
        btnExclusaoEtiquetas.addEventListener('click', function() {
            document.getElementById('nav-validades').click();
            setTimeout(() => {
                carregarTabelaEtiquetas();
            }, 100);
        });
    }
}

// Função para adicionar o filtro de etiquetas
function adicionarFiltroEtiquetas(container) {
    const filtroContainer = document.createElement('div');
    filtroContainer.className = 'etiquetas-filtro';
    
    filtroContainer.innerHTML = `
        <label for="filtro-periodo">Filtrar por:</label>
        <select id="filtro-periodo" class="form-control">
            <option value="todos">Todas as etiquetas</option>
            <option value="vencidas">Vencidas</option>
            <option value="ontem">Ontem</option>
            <option value="hoje">Hoje</option>
            <option value="amanha">Amanhã</option>
            <option value="futuras">Futuras</option>
        </select>
        <button id="btn-filtrar-etiquetas" class="btn-filtrar">Filtrar</button>
    `;
    
    container.appendChild(filtroContainer);
    
    // Adiciona evento ao botão de filtrar
    const btnFiltrar = filtroContainer.querySelector('#btn-filtrar-etiquetas');
    if (btnFiltrar) {
        btnFiltrar.addEventListener('click', function() {
            carregarTabelaEtiquetas();
        });
    }
}

// Função para carregar a tabela de etiquetas
function carregarTabelaEtiquetas() {
    // Obtém o container da tabela
    const container = document.querySelector('.etiquetas-tabela-container');
    if (!container) return;
    
    // Remove a tabela existente se houver
    const tabelaExistente = container.querySelector('.etiquetas-tabela');
    if (tabelaExistente) {
        tabelaExistente.remove();
    }
    
    // Obtém o filtro selecionado
    const filtro = document.getElementById('filtro-periodo').value;
    
    // Obtém as etiquetas filtradas
    const etiquetas = filtrarEtiquetas(filtro);
    
    // Cria a tabela
    const tabela = document.createElement('table');
    tabela.className = 'etiquetas-tabela';
    
    // Cabeçalho da tabela
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Produto</th>
            <th>Responsável</th>
            <th>Manipulação</th>
            <th>Validade</th>
            <th>Status</th>
            <th>Ações</th>
        </tr>
    `;
    tabela.appendChild(thead);
    
    // Corpo da tabela
    const tbody = document.createElement('tbody');
    
    if (etiquetas.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="6" style="text-align: center;">Nenhuma etiqueta encontrada.</td>`;
        tbody.appendChild(tr);
    } else {
        etiquetas.forEach(etiqueta => {
            const tr = document.createElement('tr');
            
            // Formata as datas
            const dataManipulacao = new Date(etiqueta.dataManipulacao);
            const dataValidade = new Date(etiqueta.dataValidade);
            
            const manipulacaoFormatada = `${dataManipulacao.getDate().toString().padStart(2, '0')}/${(dataManipulacao.getMonth() + 1).toString().padStart(2, '0')}/${dataManipulacao.getFullYear()}`;
            const validadeFormatada = `${dataValidade.getDate().toString().padStart(2, '0')}/${(dataValidade.getMonth() + 1).toString().padStart(2, '0')}/${dataValidade.getFullYear()}`;
            
            // Determina o status da etiqueta
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            
            const ontem = new Date(hoje);
            ontem.setDate(ontem.getDate() - 1);
            
            const amanha = new Date(hoje);
            amanha.setDate(amanha.getDate() + 1);
            
            dataValidade.setHours(0, 0, 0, 0);
            
            let statusClass = '';
            let statusText = '';
            
            if (dataValidade < ontem) {
                statusClass = 'etiqueta-vencida';
                statusText = 'Vencida';
            } else if (dataValidade.getTime() === ontem.getTime()) {
                statusClass = 'etiqueta-vencida';
                statusText = 'Vencida (Ontem)';
            } else if (dataValidade.getTime() === hoje.getTime()) {
                statusClass = 'etiqueta-hoje';
                statusText = 'Vence Hoje';
            } else if (dataValidade.getTime() === amanha.getTime()) {
                statusClass = 'etiqueta-futura';
                statusText = 'Vence Amanhã';
            } else {
                statusClass = 'etiqueta-futura';
                statusText = 'Válida';
            }
            
            tr.innerHTML = `
                <td>${etiqueta.produto.nome}</td>
                <td>${etiqueta.responsavel.nome}</td>
                <td>${manipulacaoFormatada}</td>
                <td>${validadeFormatada}</td>
                <td class="${statusClass}">${statusText}</td>
                <td>
                    <button class="btn-excluir-etiqueta" data-id="${etiqueta.id}">
                        <i class="fas fa-trash-alt"></i> Excluir
                    </button>
                </td>
            `;
            
            tbody.appendChild(tr);
        });
    }
    
    tabela.appendChild(tbody);
    container.appendChild(tabela);
    
    // Adiciona eventos aos botões de excluir
    const botoesExcluir = document.querySelectorAll('.btn-excluir-etiqueta');
    botoesExcluir.forEach(botao => {
        botao.addEventListener('click', function() {
            const id = this.dataset.id;
            excluirEtiqueta(id);
        });
    });
}

// Função para filtrar etiquetas
function filtrarEtiquetas(filtro) {
    // Obtém todas as etiquetas
    const etiquetas = getEtiquetas();
    
    // Se o filtro for 'todos', retorna todas as etiquetas
    if (filtro === 'todos') {
        return etiquetas;
    }
    
    // Agrupa as etiquetas por data de validade
    const grupos = groupEtiquetasByValidade();
    
    // Retorna as etiquetas de acordo com o filtro
    switch (filtro) {
        case 'vencidas':
            return grupos.vencidas;
        case 'ontem':
            return grupos.ontem;
        case 'hoje':
            return grupos.hoje;
        case 'amanha':
            return grupos.amanha;
        case 'futuras':
            return grupos.futuras;
        default:
            return etiquetas;
    }
}

// Inicializa a tabela de etiquetas quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa a tabela de etiquetas
    initEtiquetasTabela();
});