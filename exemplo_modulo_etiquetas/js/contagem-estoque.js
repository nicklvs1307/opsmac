/**
 * contagem-estoque.js - Gerenciamento de contagem de estoque para o Etiquetafy
 * Este script implementa as funcionalidades de contagem de estoque utilizando QR Codes
 * e armazena os dados no localStorage
 */

// Inicialização do banco de dados local
function initContagemEstoqueDatabase() {
    // Verifica se já existe a lista de contagens no localStorage
    if (!localStorage.getItem('contagens')) {
        // Inicializa com uma lista vazia
        localStorage.setItem('contagens', JSON.stringify([]));
    }
}

// Função para obter todas as contagens
function getContagens() {
    return JSON.parse(localStorage.getItem('contagens') || '[]');
}

// Função para adicionar uma nova contagem
function addContagem(contagem) {
    const contagens = getContagens();
    
    // Gera um ID único para a contagem
    contagem.id = Date.now().toString();
    
    // Define a data atual se não for fornecida
    if (!contagem.timestamp) {
        contagem.timestamp = new Date().toISOString();
    }
    
    contagens.push(contagem);
    localStorage.setItem('contagens', JSON.stringify(contagens));
    
    // Atualiza o saldo do produto no estoque, se necessário
    if (typeof atualizarSaldoProduto === 'function' && contagem.ajustarEstoque) {
        atualizarSaldoProduto(contagem.produto.id, 'saida', contagem.diferenca);
    }
    
    return contagem;
}

// Função para buscar contagens por produto
function getContagensByProduto(produtoId) {
    const contagens = getContagens();
    return contagens.filter(c => c.produto.id === produtoId);
}

// Função para buscar contagens por período
function getContagensByPeriodo(dataInicio, dataFim) {
    const contagens = getContagens();
    
    // Se não houver datas, retorna todas as contagens
    if (!dataInicio && !dataFim) return contagens;
    
    // Converte as datas para objetos Date
    const inicio = dataInicio ? new Date(dataInicio) : new Date(0); // Data mínima
    const fim = dataFim ? new Date(dataFim) : new Date(8640000000000000); // Data máxima
    
    return contagens.filter(c => {
        const dataContagem = new Date(c.timestamp);
        return dataContagem >= inicio && dataContagem <= fim;
    });
}

// Função para iniciar a contagem de estoque via seleção de produto
function iniciarContagemEstoque() {
    // Cria e exibe o modal de contagem
    const modalHTML = `
        <div class="modal" id="contagem-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Contagem de Estoque</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="contagem-produto-busca">Buscar Produto:</label>
                        <input type="text" id="contagem-produto-busca" class="form-control" placeholder="Digite para buscar produtos...">
                    </div>
                    <div class="form-group">
                        <label for="contagem-produto-select">Selecione o Produto:</label>
                        <select id="contagem-produto-select" class="form-control">
                            <option value="">-- Selecione um produto --</option>
                            <!-- Opções serão carregadas via JavaScript -->
                        </select>
                    </div>
                    <div id="contagem-form" style="display: none;">
                        <div class="form-group">
                            <label for="contagem-quantidade">Quantidade encontrada:</label>
                            <input type="number" id="contagem-quantidade" class="form-control" value="1" min="0">
                        </div>
                        <div class="form-group">
                            <label for="contagem-saldo-atual">Saldo atual:</label>
                            <input type="text" id="contagem-saldo-atual" class="form-control" readonly>
                        </div>
                        <div class="form-group">
                            <label for="contagem-diferenca">Diferença:</label>
                            <input type="text" id="contagem-diferenca" class="form-control" readonly>
                        </div>
                        <div class="form-check">
                            <input type="checkbox" id="contagem-ajustar-estoque" class="form-check-input">
                            <label for="contagem-ajustar-estoque" class="form-check-label">Ajustar estoque automaticamente</label>
                        </div>
                        <div class="form-group">
                            <label for="contagem-observacao">Observação:</label>
                            <textarea id="contagem-observacao" class="form-control" rows="2"></textarea>
                        </div>
                        <button id="contagem-salvar" class="btn btn-primary">Salvar Contagem</button>
                        <button id="contagem-limpar" class="btn btn-secondary">Limpar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Adiciona o modal ao corpo do documento
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstElementChild);
    
    // Exibe o modal
    const modal = document.getElementById('contagem-modal');
    modal.style.display = 'block';
    
    // Configura o botão de fechar
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', function() {
        // Remove o modal
        modal.remove();
    });
    
    // Carrega os produtos no select
    carregarProdutosSelect();
    
    // Configura o campo de busca
    const buscaInput = document.getElementById('contagem-produto-busca');
    buscaInput.addEventListener('input', function() {
        filtrarProdutosSelect(this.value);
    });
    
    // Configura o evento de mudança do select de produtos
    const produtoSelect = document.getElementById('contagem-produto-select');
    produtoSelect.addEventListener('change', function() {
        const produtoId = this.value;
        if (produtoId) {
            // Exibe o formulário de contagem
            document.getElementById('contagem-form').style.display = 'block';
            
            // Obtém o saldo atual do produto
            const saldoAtual = getSaldoProduto(produtoId);
            document.getElementById('contagem-saldo-atual').value = saldoAtual;
            
            // Configura o evento de mudança da quantidade para calcular a diferença
            const quantidadeInput = document.getElementById('contagem-quantidade');
            
            // Remove event listeners anteriores para evitar duplicação
            const novoQuantidadeInput = quantidadeInput.cloneNode(true);
            quantidadeInput.parentNode.replaceChild(novoQuantidadeInput, quantidadeInput);
            
            // Adiciona o novo event listener
            novoQuantidadeInput.addEventListener('input', function() {
                const quantidade = parseInt(this.value || '0');
                const diferenca = quantidade - saldoAtual;
                document.getElementById('contagem-diferenca').value = diferenca;
            });
            
            // Define o valor inicial da quantidade como 0 para que o usuário precise digitar
            // a quantidade real encontrada
            novoQuantidadeInput.value = '0';
            
            // Dispara o evento para calcular a diferença inicial
            novoQuantidadeInput.dispatchEvent(new Event('input'));
            
            // Foca no campo de quantidade para facilitar a digitação
            novoQuantidadeInput.focus();
            novoQuantidadeInput.select();
        } else {
            // Esconde o formulário se nenhum produto for selecionado
            document.getElementById('contagem-form').style.display = 'none';
        }
    });
    
    // Configura o botão de salvar
    const salvarBtn = document.getElementById('contagem-salvar');
    salvarBtn.addEventListener('click', function() {
        // Obtém o produto selecionado
        const produtoId = document.getElementById('contagem-produto-select').value;
        if (!produtoId) {
            alert('Selecione um produto para continuar.');
            return;
        }
        
        const produto = getProdutoById(produtoId);
        
        // Obtém os dados do formulário
        const quantidade = parseInt(document.getElementById('contagem-quantidade').value || '0');
        const saldoAtual = parseInt(document.getElementById('contagem-saldo-atual').value || '0');
        const diferenca = quantidade - saldoAtual;
        const ajustarEstoque = document.getElementById('contagem-ajustar-estoque').checked;
        const observacao = document.getElementById('contagem-observacao').value || '';
        
        // Cria o objeto de contagem
        const contagem = {
            produto: {
                id: produto.id,
                nome: produto.nome
            },
            quantidade,
            saldoAnterior: saldoAtual,
            diferenca,
            ajustarEstoque,
            observacao,
            timestamp: new Date().toISOString()
        };
        
        // Adiciona a contagem ao banco de dados
        addContagem(contagem);
        
        // Atualiza o saldo do produto no estoque, se necessário
        if (ajustarEstoque && diferenca !== 0) {
            // Se a quantidade contada for maior que o saldo, é uma entrada
            // Se for menor, é uma saída
            const tipo = diferenca > 0 ? 'entrada' : 'saida';
            atualizarSaldoProduto(produtoId, tipo, Math.abs(diferenca));
        }
        
        // Exibe mensagem de sucesso
        alert('Contagem registrada com sucesso!');
        
        // Fecha o modal
        modal.remove();
    });
    
    // Configura o botão de limpar
    const limparBtn = document.getElementById('contagem-limpar');
    limparBtn.addEventListener('click', function() {
        document.getElementById('contagem-produto-select').value = '';
        document.getElementById('contagem-form').style.display = 'none';
        document.getElementById('contagem-quantidade').value = '1';
        document.getElementById('contagem-observacao').value = '';
        document.getElementById('contagem-ajustar-estoque').checked = false;
    });
}

// Função para carregar os produtos no select
function carregarProdutosSelect() {
    const select = document.getElementById('contagem-produto-select');
    if (!select) return;
    
    // Limpa as opções existentes, mantendo apenas a primeira (placeholder)
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    // Obtém todos os produtos ativos
    const produtos = getProdutos().filter(p => p.status === 'ativo');
    
    // Adiciona cada produto como uma opção
    produtos.forEach(produto => {
        const option = document.createElement('option');
        option.value = produto.id;
        option.textContent = produto.nome;
        select.appendChild(option);
    });
}

// Função para filtrar produtos no select com base no texto de busca
function filtrarProdutosSelect(termoBusca) {
    const select = document.getElementById('contagem-produto-select');
    if (!select) return;
    
    // Obtém todos os produtos ativos
    const produtos = getProdutos().filter(p => p.status === 'ativo');
    
    // Limpa as opções existentes, mantendo apenas a primeira (placeholder)
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    // Se não houver termo de busca, mostra todos os produtos
    if (!termoBusca.trim()) {
        produtos.forEach(produto => {
            const option = document.createElement('option');
            option.value = produto.id;
            option.textContent = produto.nome;
            select.appendChild(option);
        });
        return;
    }
    
    // Filtra os produtos que contêm o termo de busca (case insensitive)
    const termoLower = termoBusca.toLowerCase();
    const produtosFiltrados = produtos.filter(p => 
        p.nome.toLowerCase().includes(termoLower) ||
        (p.codigo && p.codigo.toLowerCase().includes(termoLower))
    );
    
    // Adiciona os produtos filtrados ao select
    produtosFiltrados.forEach(produto => {
        const option = document.createElement('option');
        option.value = produto.id;
        option.textContent = produto.nome;
        select.appendChild(option);
    });
    
    // Se houver apenas um produto filtrado, seleciona-o automaticamente
    if (produtosFiltrados.length === 1) {
        select.value = produtosFiltrados[0].id;
        // Dispara o evento change para atualizar o formulário
        select.dispatchEvent(new Event('change'));
    }
}

// Função para exibir o histórico de contagens
function exibirHistoricoContagens() {
    // Cria e exibe o modal de histórico
    const modalHTML = `
        <div class="modal" id="historico-contagens-modal">
            <div class="modal-content modal-lg">
                <div class="modal-header">
                    <h3>Histórico de Contagens</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="filter-container">
                        <div class="form-group">
                            <label for="historico-data-inicio">Data Início</label>
                            <input type="date" id="historico-data-inicio" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="historico-data-fim">Data Fim</label>
                            <input type="date" id="historico-data-fim" class="form-control">
                        </div>
                        <button id="historico-filtrar" class="btn btn-secondary">Filtrar</button>
                    </div>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Data/Hora</th>
                                    <th>Produto</th>
                                    <th>Saldo Anterior</th>
                                    <th>Quantidade</th>
                                    <th>Ajuste</th>
                                    <th>Observação</th>
                                </tr>
                            </thead>
                            <tbody id="historico-contagens-tbody">
                                <!-- Dados serão carregados via JavaScript -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Adiciona o modal ao corpo do documento
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstElementChild);
    
    // Exibe o modal
    const modal = document.getElementById('historico-contagens-modal');
    modal.style.display = 'block';
    
    // Configura o botão de fechar
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', function() {
        // Remove o modal
        modal.remove();
    });
    
    // Carrega os dados iniciais
    carregarHistoricoContagens();
    
    // Configura o botão de filtrar
    const filtrarBtn = document.getElementById('historico-filtrar');
    if (filtrarBtn) {
        filtrarBtn.addEventListener('click', function() {
            carregarHistoricoContagens();
        });
    }
}

// Função para carregar o histórico de contagens
function carregarHistoricoContagens() {
    // Obtém os filtros
    const dataInicio = document.getElementById('historico-data-inicio').value;
    const dataFim = document.getElementById('historico-data-fim').value;
    
    // Obtém as contagens filtradas
    const contagens = getContagensByPeriodo(
        dataInicio ? new Date(dataInicio) : null,
        dataFim ? new Date(dataFim) : null
    );
    
    // Obtém a tabela
    const tbody = document.getElementById('historico-contagens-tbody');
    if (!tbody) return;
    
    // Limpa a tabela
    tbody.innerHTML = '';
    
    // Se não houver contagens, exibe mensagem
    if (contagens.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="6" class="text-center">Nenhuma contagem registrada</td>';
        tbody.appendChild(tr);
        return;
    }
    
    // Adiciona as contagens à tabela
    contagens.forEach(contagem => {
        const tr = document.createElement('tr');
        
        // Formata a data
        const data = new Date(contagem.timestamp);
        const dataFormatada = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()} ${data.getHours().toString().padStart(2, '0')}:${data.getMinutes().toString().padStart(2, '0')}`;
        
        tr.innerHTML = `
            <td>${dataFormatada}</td>
            <td>${contagem.produto.nome}</td>
            <td>${contagem.saldoAnterior || 0}</td>
            <td>${contagem.quantidade}</td>
            <td>${contagem.ajustarEstoque ? 'Sim' : 'Não'}</td>
            <td>${contagem.observacao || '-'}</td>
        `;
        
        tbody.appendChild(tr);
    });

}

// Inicializa os eventos relacionados à contagem de estoque quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa o banco de dados de contagens
    initContagemEstoqueDatabase();
    
    // Botão para iniciar a contagem de estoque
    const btnIniciarContagem = document.getElementById('btn-iniciar-contagem');
    if (btnIniciarContagem) {
        // Atualiza o texto do botão para refletir a nova funcionalidade
        btnIniciarContagem.innerHTML = '<i class="fas fa-clipboard-list"></i> Contagem de Produtos';
        btnIniciarContagem.addEventListener('click', iniciarContagemEstoque);
    }
    
    // Botão para exibir o histórico de contagens
    const btnHistoricoContagens = document.getElementById('btn-historico-contagens');
    if (btnHistoricoContagens) {
        btnHistoricoContagens.addEventListener('click', exibirHistoricoContagens);
    }
});

// Verifica se a função getProdutos está disponível, caso contrário, importa-a
if (typeof getProdutos !== 'function') {
    // Função para obter todos os produtos (fallback caso não esteja disponível)
    function getProdutos() {
        return JSON.parse(localStorage.getItem('produtos') || '[]');
    }
}

// Verifica se a função getProdutoById está disponível, caso contrário, importa-a
if (typeof getProdutoById !== 'function') {
    // Função para buscar um produto pelo ID (fallback caso não esteja disponível)
    function getProdutoById(id) {
        const produtos = getProdutos();
        return produtos.find(p => p.id === id) || null;
    }
}