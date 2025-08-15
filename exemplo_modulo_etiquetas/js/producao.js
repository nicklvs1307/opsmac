/**
 * producao.js - Gerenciamento de produção para o Etiquetafy
 * Este script implementa as funcionalidades de registro e controle de produção
 * utilizando localStorage como banco de dados local
 */

// Inicialização do banco de dados local
function initProducaoDatabase() {
    // Verifica se já existe a lista de produções no localStorage
    if (!localStorage.getItem('producao')) {
        // Inicializa com uma lista vazia
        localStorage.setItem('producao', JSON.stringify([]));
    }
}

// Função para obter todos os registros de produção
function getProducao() {
    return JSON.parse(localStorage.getItem('producao') || '[]');
}

// Função para adicionar um novo registro de produção
function addProducao(producao) {
    const registros = getProducao();
    
    // Gera um ID único para o registro
    producao.id = Date.now().toString();
    
    // Define a data atual se não for fornecida
    if (!producao.data) {
        const dataAtual = new Date();
        producao.data = dataAtual.toISOString();
    }
    
    registros.push(producao);
    localStorage.setItem('producao', JSON.stringify(registros));
    
    // Atualiza o estoque se necessário
    if (typeof atualizarSaldoProduto === 'function') {
        // Atualiza o estoque do produto final (entrada)
        atualizarSaldoProduto(producao.produtoId, 'entrada', producao.quantidade);
        
        // Atualiza o estoque dos insumos (saída)
        if (producao.insumos && Array.isArray(producao.insumos)) {
            producao.insumos.forEach(insumo => {
                atualizarSaldoProduto(insumo.produtoId, 'saida', insumo.quantidade);
            });
        }
    }
    
    return producao;
}

// Função para atualizar um registro de produção existente
function updateProducao(id, dadosAtualizados) {
    const registros = getProducao();
    const index = registros.findIndex(p => p.id === id);
    
    if (index !== -1) {
        // Reverte as atualizações de estoque anteriores
        const producaoAntiga = registros[index];
        
        if (typeof atualizarSaldoProduto === 'function') {
            // Reverte a entrada do produto final
            atualizarSaldoProduto(producaoAntiga.produtoId, 'saida', producaoAntiga.quantidade);
            
            // Reverte a saída dos insumos
            if (producaoAntiga.insumos && Array.isArray(producaoAntiga.insumos)) {
                producaoAntiga.insumos.forEach(insumo => {
                    atualizarSaldoProduto(insumo.produtoId, 'entrada', insumo.quantidade);
                });
            }
        }
        
        // Atualiza o registro
        registros[index] = { ...producaoAntiga, ...dadosAtualizados };
        localStorage.setItem('producao', JSON.stringify(registros));
        
        // Aplica as novas atualizações de estoque
        const producaoNova = registros[index];
        
        if (typeof atualizarSaldoProduto === 'function') {
            // Atualiza a entrada do produto final
            atualizarSaldoProduto(producaoNova.produtoId, 'entrada', producaoNova.quantidade);
            
            // Atualiza a saída dos insumos
            if (producaoNova.insumos && Array.isArray(producaoNova.insumos)) {
                producaoNova.insumos.forEach(insumo => {
                    atualizarSaldoProduto(insumo.produtoId, 'saida', insumo.quantidade);
                });
            }
        }
        
        return registros[index];
    }
    
    return null;
}

// Função para excluir um registro de produção
function deleteProducao(id) {
    const registros = getProducao();
    const index = registros.findIndex(p => p.id === id);
    
    if (index !== -1) {
        // Reverte as atualizações de estoque
        const producao = registros[index];
        
        if (typeof atualizarSaldoProduto === 'function') {
            // Reverte a entrada do produto final
            atualizarSaldoProduto(producao.produtoId, 'saida', producao.quantidade);
            
            // Reverte a saída dos insumos
            if (producao.insumos && Array.isArray(producao.insumos)) {
                producao.insumos.forEach(insumo => {
                    atualizarSaldoProduto(insumo.produtoId, 'entrada', insumo.quantidade);
                });
            }
        }
    }
    
    const novaLista = registros.filter(p => p.id !== id);
    localStorage.setItem('producao', JSON.stringify(novaLista));
    return true;
}

// Função para buscar um registro de produção pelo ID
function getProducaoById(id) {
    const registros = getProducao();
    return registros.find(p => p.id === id) || null;
}

// Função para buscar registros de produção por produto
function getProducaoByProduto(produtoId) {
    const registros = getProducao();
    return registros.filter(p => p.produtoId === produtoId);
}

// Função para buscar registros de produção por período
function getProducaoByPeriodo(dataInicio, dataFim) {
    const registros = getProducao();
    
    // Se não houver datas, retorna todos os registros
    if (!dataInicio && !dataFim) return registros;
    
    // Converte as datas para objetos Date
    const inicio = dataInicio ? new Date(dataInicio) : new Date(0); // Data mínima
    const fim = dataFim ? new Date(dataFim) : new Date(8640000000000000); // Data máxima
    
    return registros.filter(p => {
        const dataProducao = new Date(p.data);
        return dataProducao >= inicio && dataProducao <= fim;
    });
}

// Função para renderizar a tabela de produção
function renderizarTabelaProducao(registros = null) {
    const tbody = document.querySelector('#producao-table tbody');
    if (!tbody) return;
    
    // Se não for fornecida uma lista, busca todos os registros
    if (registros === null) {
        registros = getProducao();
    }
    
    // Limpa a tabela
    tbody.innerHTML = '';
    
    if (registros.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="6" class="text-center">Nenhum registro de produção encontrado</td>';
        tbody.appendChild(tr);
        return;
    }
    
    // Obtém a lista de produtos para exibir os nomes
    const produtos = JSON.parse(localStorage.getItem('produtos') || '[]');
    const produtosMap = {};
    produtos.forEach(p => {
        produtosMap[p.id] = p.nome;
    });
    
    // Adiciona cada registro à tabela
    registros.forEach(registro => {
        const tr = document.createElement('tr');
        
        // Formata a data para exibição
        const data = new Date(registro.data);
        const dataFormatada = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}`;
        
        tr.innerHTML = `
            <td>${produtosMap[registro.produtoId] || 'Produto não encontrado'}</td>
            <td>${registro.quantidade}</td>
            <td>${dataFormatada}</td>
            <td>${registro.responsavel ? registro.responsavel.nome : '-'}</td>
            <td>${registro.observacao || '-'}</td>
            <td class="action-buttons">
                <button class="btn-action btn-edit-producao" data-id="${registro.id}" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="btn-action btn-delete-producao" data-id="${registro.id}" title="Excluir"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    // Adiciona os eventos aos botões de ação
    adicionarEventosBotoesProducao();
}

// Função para adicionar eventos aos botões de ação da tabela de produção
function adicionarEventosBotoesProducao() {
    // Botões de editar
    document.querySelectorAll('.btn-edit-producao').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            abrirModalProducao(id);
        });
    });
    
    // Botões de excluir
    document.querySelectorAll('.btn-delete-producao').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            if (confirm('Tem certeza que deseja excluir este registro de produção?')) {
                deleteProducao(id);
                renderizarTabelaProducao();
            }
        });
    });
}

// Função para abrir o modal de produção (novo ou edição)
function abrirModalProducao(id = null) {
    // Cria o HTML do modal
    const modalHTML = `
        <div class="modal" id="producao-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${id ? 'Editar' : 'Novo'} Registro de Produção</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="producao-form">
                        <input type="hidden" id="producao-id" value="${id || ''}">
                        
                        <div class="form-group">
                            <label for="producao-produto">Produto Final</label>
                            <select id="producao-produto" class="form-control" required>
                                <option value="">Selecione um produto</option>
                                <!-- Opções serão carregadas via JavaScript -->
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="producao-quantidade">Quantidade Produzida</label>
                            <input type="number" id="producao-quantidade" class="form-control" min="1" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="producao-data">Data de Produção</label>
                            <input type="date" id="producao-data" class="form-control" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="producao-responsavel">Responsável</label>
                            <select id="producao-responsavel" class="form-control">
                                <option value="">Selecione um responsável</option>
                                <!-- Opções serão carregadas via JavaScript -->
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="producao-observacao">Observação</label>
                            <textarea id="producao-observacao" class="form-control" rows="2"></textarea>
                        </div>
                        
                        <h4>Insumos Utilizados</h4>
                        <div id="insumos-container">
                            <!-- Insumos serão adicionados aqui -->
                        </div>
                        
                        <button type="button" id="btn-adicionar-insumo" class="btn btn-secondary">Adicionar Insumo</button>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Salvar</button>
                            <button type="button" class="btn btn-secondary close-modal">Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Adiciona o modal ao corpo do documento
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstElementChild);
    
    // Exibe o modal
    const modal = document.getElementById('producao-modal');
    modal.style.display = 'block';
    
    // Carrega os produtos
    carregarProdutosSelect('producao-produto');
    
    // Carrega os responsáveis
    carregarResponsaveisSelect('producao-responsavel');
    
    // Se for edição, carrega os dados do registro
    if (id) {
        const registro = getProducaoById(id);
        if (registro) {
            document.getElementById('producao-produto').value = registro.produtoId;
            document.getElementById('producao-quantidade').value = registro.quantidade;
            
            // Formata a data para o formato YYYY-MM-DD
            const data = new Date(registro.data);
            const dataFormatada = `${data.getFullYear()}-${(data.getMonth() + 1).toString().padStart(2, '0')}-${data.getDate().toString().padStart(2, '0')}`;
            document.getElementById('producao-data').value = dataFormatada;
            
            if (registro.responsavel) {
                document.getElementById('producao-responsavel').value = registro.responsavel.id;
            }
            
            document.getElementById('producao-observacao').value = registro.observacao || '';
            
            // Carrega os insumos
            if (registro.insumos && Array.isArray(registro.insumos)) {
                registro.insumos.forEach(insumo => {
                    adicionarInsumo(insumo.produtoId, insumo.quantidade);
                });
            }
        }
    } else {
        // Se for novo registro, define a data atual
        const hoje = new Date();
        const dataFormatada = `${hoje.getFullYear()}-${(hoje.getMonth() + 1).toString().padStart(2, '0')}-${hoje.getDate().toString().padStart(2, '0')}`;
        document.getElementById('producao-data').value = dataFormatada;
        
        // Adiciona um insumo vazio
        adicionarInsumo();
    }
    
    // Configura o botão de adicionar insumo
    document.getElementById('btn-adicionar-insumo').addEventListener('click', function() {
        adicionarInsumo();
    });
    
    // Configura o formulário
    document.getElementById('producao-form').addEventListener('submit', function(e) {
        e.preventDefault();
        salvarProducao();
    });
    
    // Configura os botões de fechar
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            modal.remove();
        });
    });
}

// Função para carregar os produtos no select
function carregarProdutosSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    // Obtém os produtos
    const produtos = JSON.parse(localStorage.getItem('produtos') || '[]');
    
    // Adiciona as opções
    produtos.forEach(produto => {
        const option = document.createElement('option');
        option.value = produto.id;
        option.textContent = produto.nome;
        select.appendChild(option);
    });
}

// Função para carregar os responsáveis no select
function carregarResponsaveisSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    // Obtém os funcionários
    const funcionarios = JSON.parse(localStorage.getItem('funcionarios') || '[]');
    
    // Adiciona as opções
    funcionarios.forEach(funcionario => {
        const option = document.createElement('option');
        option.value = funcionario.id;
        option.textContent = funcionario.nome;
        select.appendChild(option);
    });
}

// Função para adicionar um insumo ao formulário
function adicionarInsumo(produtoId = '', quantidade = '') {
    const container = document.getElementById('insumos-container');
    if (!container) return;
    
    // Cria um ID único para o insumo
    const insumoId = Date.now().toString();
    
    // Cria o HTML do insumo
    const insumoHTML = `
        <div class="insumo-item" data-id="${insumoId}">
            <div class="form-row">
                <div class="form-group col-md-6">
                    <label for="insumo-produto-${insumoId}">Produto</label>
                    <select id="insumo-produto-${insumoId}" class="form-control insumo-produto" required>
                        <option value="">Selecione um produto</option>
                        <!-- Opções serão carregadas via JavaScript -->
                    </select>
                </div>
                <div class="form-group col-md-4">
                    <label for="insumo-quantidade-${insumoId}">Quantidade</label>
                    <input type="number" id="insumo-quantidade-${insumoId}" class="form-control insumo-quantidade" min="1" value="${quantidade}" required>
                </div>
                <div class="form-group col-md-2">
                    <label>&nbsp;</label>
                    <button type="button" class="btn btn-danger btn-remover-insumo" data-id="${insumoId}">Remover</button>
                </div>
            </div>
        </div>
    `;
    
    // Adiciona o insumo ao container
    container.insertAdjacentHTML('beforeend', insumoHTML);
    
    // Carrega os produtos no select
    carregarProdutosSelect(`insumo-produto-${insumoId}`);
    
    // Define o produto selecionado, se fornecido
    if (produtoId) {
        document.getElementById(`insumo-produto-${insumoId}`).value = produtoId;
    }
    
    // Configura o botão de remover
    document.querySelector(`.btn-remover-insumo[data-id="${insumoId}"]`).addEventListener('click', function() {
        document.querySelector(`.insumo-item[data-id="${insumoId}"]`).remove();
    });
}

// Função para salvar o registro de produção
function salvarProducao() {
    // Obtém os dados do formulário
    const id = document.getElementById('producao-id').value;
    const produtoId = document.getElementById('producao-produto').value;
    const quantidade = parseInt(document.getElementById('producao-quantidade').value);
    const dataStr = document.getElementById('producao-data').value;
    const responsavelId = document.getElementById('producao-responsavel').value;
    const observacao = document.getElementById('producao-observacao').value;
    
    // Converte a data para ISO string
    const data = new Date(dataStr);
    
    // Obtém os insumos
    const insumos = [];
    document.querySelectorAll('.insumo-item').forEach(item => {
        const insumoId = item.getAttribute('data-id');
        const produtoId = document.getElementById(`insumo-produto-${insumoId}`).value;
        const quantidade = parseInt(document.getElementById(`insumo-quantidade-${insumoId}`).value);
        
        if (produtoId && quantidade) {
            insumos.push({
                produtoId,
                quantidade
            });
        }
    });
    
    // Obtém o responsável
    let responsavel = null;
    if (responsavelId) {
        const funcionarios = JSON.parse(localStorage.getItem('funcionarios') || '[]');
        const funcionario = funcionarios.find(f => f.id === responsavelId);
        if (funcionario) {
            responsavel = {
                id: funcionario.id,
                nome: funcionario.nome
            };
        }
    }
    
    // Cria o objeto de produção
    const producao = {
        produtoId,
        quantidade,
        data: data.toISOString(),
        responsavel,
        observacao,
        insumos
    };
    
    // Salva o registro
    if (id) {
        updateProducao(id, producao);
    } else {
        addProducao(producao);
    }
    
    // Fecha o modal
    document.getElementById('producao-modal').remove();
    
    // Atualiza a tabela
    renderizarTabelaProducao();
}

// Inicializa os eventos relacionados à produção quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa o banco de dados de produção
    initProducaoDatabase();
    
    // Botão para abrir o modal de nova produção
    const btnNovaProducao = document.getElementById('btn-nova-producao');
    if (btnNovaProducao) {
        btnNovaProducao.addEventListener('click', function() {
            abrirModalProducao();
        });
    }
    
    // Carrega a tabela de produção quando a seção for exibida
    const navProducao = document.getElementById('nav-producao');
    if (navProducao) {
        navProducao.addEventListener('click', function() {
            renderizarTabelaProducao();
        });
    }
    
    // Botão para filtrar a tabela de produção
    const btnFiltrarProducao = document.getElementById('btn-filtrar-producao');
    if (btnFiltrarProducao) {
        btnFiltrarProducao.addEventListener('click', function() {
            const dataInicio = document.getElementById('producao-data-inicio').value;
            const dataFim = document.getElementById('producao-data-fim').value;
            
            const registros = getProducaoByPeriodo(
                dataInicio ? new Date(dataInicio) : null,
                dataFim ? new Date(dataFim) : null
            );
            
            renderizarTabelaProducao(registros);
        });
    }
});