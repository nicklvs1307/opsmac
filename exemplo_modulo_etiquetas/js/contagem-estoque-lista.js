/**
 * contagem-estoque-lista.js - Implementação da contagem de estoque em formato de lista
 * Este script implementa a visualização de todos os produtos do estoque em formato de lista
 * permitindo a contagem rápida de múltiplos produtos
 */

// Função para inicializar a seção de contagem de estoque em lista
function initContagemEstoqueLista() {
    // Verifica se a seção já existe
    if (!document.getElementById('contagem-estoque-section')) {
        console.error('Seção de contagem de estoque não encontrada');
        return;
    }

    // Carrega os produtos na lista
    carregarProdutosLista();

    // Configura o botão de salvar contagem
    const btnSalvarContagem = document.getElementById('btn-salvar-contagem-lista');
    if (btnSalvarContagem) {
        btnSalvarContagem.addEventListener('click', salvarContagemLista);
    }
}

// Função para carregar os produtos na lista de contagem
function carregarProdutosLista() {
    const listaContainer = document.getElementById('produtos-contagem-lista');
    if (!listaContainer) return;

    // Limpa a lista
    listaContainer.innerHTML = '';

    // Obtém todos os produtos ativos
    const produtos = getProdutos().filter(p => p.status === 'ativo');

    // Se não houver produtos, exibe mensagem
    if (produtos.length === 0) {
        listaContainer.innerHTML = '<p class="text-center">Nenhum produto cadastrado</p>';
        return;
    }

    // Cria a tabela
    const table = document.createElement('table');
    table.className = 'table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Produto</th>
                <th>Estoque Atual</th>
                <th>Quantidade Contada</th>
            </tr>
        </thead>
        <tbody>
            <!-- Produtos serão adicionados aqui -->
        </tbody>
    `;

    // Adiciona os produtos à tabela
    const tbody = table.querySelector('tbody');
    produtos.forEach(produto => {
        // Obtém o saldo atual do produto
        const saldoAtual = getSaldoProduto(produto.id);

        // Cria a linha da tabela
        const tr = document.createElement('tr');
        tr.dataset.produtoId = produto.id;
        tr.innerHTML = `
            <td>${produto.nome}</td>
            <td>${saldoAtual}</td>
            <td>
                <input type="number" class="form-control contagem-quantidade" min="0" value="">
            </td>
        `;

        // Adiciona evento para destacar a linha quando preenchida
        const inputQuantidade = tr.querySelector('.contagem-quantidade');
        inputQuantidade.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                tr.style.backgroundColor = '#E8F5E9'; // Verde claro
            } else {
                tr.style.backgroundColor = ''; // Remove o destaque
            }
        });

        tbody.appendChild(tr);
    });

    // Adiciona a tabela ao container
    listaContainer.appendChild(table);
}

// Função para salvar a contagem de todos os produtos
function salvarContagemLista() {
    // Obtém todas as linhas da tabela
    const linhas = document.querySelectorAll('#produtos-contagem-lista tbody tr');
    let produtosContados = 0;

    // Para cada linha, verifica se há quantidade preenchida
    linhas.forEach(linha => {
        const produtoId = linha.dataset.produtoId;
        const inputQuantidade = linha.querySelector('.contagem-quantidade');
        const quantidadeContada = inputQuantidade.value.trim();

        // Se houver quantidade preenchida, registra a contagem
        if (quantidadeContada !== '') {
            const produto = getProdutoById(produtoId);
            const saldoAtual = getSaldoProduto(produtoId);
            const quantidade = parseInt(quantidadeContada);
            const diferenca = quantidade - saldoAtual;

            // Cria o objeto de contagem
            const contagem = {
                produto: {
                    id: produto.id,
                    nome: produto.nome
                },
                quantidade,
                saldoAnterior: saldoAtual,
                diferenca,
                ajustarEstoque: true, // Por padrão, ajusta o estoque
                observacao: 'Contagem em lista',
                timestamp: new Date().toISOString()
            };

            // Adiciona a contagem ao banco de dados
            addContagem(contagem);

            // Atualiza o saldo do produto no estoque
            if (diferenca !== 0) {
                const tipo = diferenca > 0 ? 'entrada' : 'saida';
                atualizarSaldoProduto(produtoId, tipo, Math.abs(diferenca));
            }

            produtosContados++;
        }
    });

    // Exibe mensagem de sucesso
    if (produtosContados > 0) {
        alert(`Contagem salva com sucesso! ${produtosContados} produto(s) contado(s).`);
        // Recarrega a lista para atualizar os saldos
        carregarProdutosLista();
    } else {
        alert('Nenhum produto foi contado. Preencha a quantidade de pelo menos um produto.');
    }
}

// Inicializa os eventos quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa a seção de contagem de estoque em lista
    initContagemEstoqueLista();
});