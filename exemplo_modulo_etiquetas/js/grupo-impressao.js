/**
 * grupo-impressao.js - Implementação da funcionalidade de impressão em grupo
 * Este script implementa a seleção múltipla de produtos e impressão em lote
 */

// Array para armazenar os produtos selecionados para impressão em grupo
let produtosSelecionados = [];

// Função para inicializar a funcionalidade de impressão em grupo
function initImpressaoGrupo() {
    // Botão para imprimir grupo
    const imprimirGrupoBtn = document.getElementById('imprimir-grupo-btn');
    if (imprimirGrupoBtn) {
        imprimirGrupoBtn.addEventListener('click', function() {
            // Adiciona feedback visual ao clicar
            this.classList.add('btn-clicked');
            setTimeout(() => this.classList.remove('btn-clicked'), 200);
            
            // Verifica se há produtos selecionados
            if (produtosSelecionados.length === 0) {
                mostrarMensagemErro('Selecione pelo menos um produto para impressão em grupo.');
                return;
            }
            
            // Confirma a impressão
            if (confirm(`Deseja imprimir ${produtosSelecionados.length} produto(s) selecionado(s)?`)) {
                // Imprime cada produto selecionado
                imprimirProdutosEmGrupo();
            }
        });
    }
}

// Função para adicionar checkboxes aos cards de produtos
function adicionarCheckboxesProdutos() {
    // Contador de produtos selecionados
    const contadorElement = document.createElement('div');
    contadorElement.id = 'contador-produtos-selecionados';
    contadorElement.className = 'produtos-selecionados-contador';
    contadorElement.innerHTML = '<span>0</span> produto(s) selecionado(s)';
    
    // Adiciona o contador à seção de produtos
    const sectionHeader = document.querySelector('#selecionar-produto-section .section-header');
    if (sectionHeader) {
        sectionHeader.appendChild(contadorElement);
    }
    
    // Adiciona estilos para o contador
    const style = document.createElement('style');
    style.textContent = `
        .produtos-selecionados-contador {
            background-color: #f8f9fa;
            padding: 8px 12px;
            border-radius: 4px;
            margin-top: 10px;
            font-size: 14px;
            color: #333;
            display: inline-block;
        }
        
        .item-card.product-card {
            position: relative;
        }
        
        .produto-checkbox {
            position: absolute;
            top: 10px;
            right: 10px;
            width: 20px;
            height: 20px;
            cursor: pointer;
            z-index: 2;
        }
    `;
    document.head.appendChild(style);
}

// Função para atualizar o contador de produtos selecionados
function atualizarContadorProdutos() {
    const contadorElement = document.getElementById('contador-produtos-selecionados');
    if (contadorElement) {
        const spanElement = contadorElement.querySelector('span');
        if (spanElement) {
            spanElement.textContent = produtosSelecionados.length;
        }
    }
}

// Função para modificar a função loadProdutos para incluir checkboxes
function modificarLoadProdutos() {
    // Armazena a função original
    const originalLoadProdutos = window.loadProdutos;
    
    // Sobrescreve a função loadProdutos
    window.loadProdutos = function(categoriaId) {
        // Limpa a lista de produtos selecionados ao carregar uma nova categoria
        produtosSelecionados = [];
        
        // Chama a função original
        originalLoadProdutos(categoriaId);
        
        // Adiciona checkboxes aos cards de produtos
        const cards = document.querySelectorAll('.product-card');
        cards.forEach(card => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'produto-checkbox';
            checkbox.dataset.id = card.dataset.id;
            
            // Adiciona evento de change ao checkbox
            checkbox.addEventListener('change', function(e) {
                e.stopPropagation(); // Evita que o clique no checkbox propague para o card
                
                // Obtém o produto correspondente
                const produtos = JSON.parse(localStorage.getItem('produtos') || '[]');
                const produto = produtos.find(p => p.id === this.dataset.id);
                
                if (this.checked) {
                    // Adiciona o produto à lista de selecionados
                    if (produto && !produtosSelecionados.some(p => p.id === produto.id)) {
                        produtosSelecionados.push(produto);
                    }
                } else {
                    // Remove o produto da lista de selecionados
                    produtosSelecionados = produtosSelecionados.filter(p => p.id !== produto.id);
                }
                
                // Atualiza o contador
                atualizarContadorProdutos();
            });
            
            // Modifica o evento de clique do card para não interferir com o checkbox
            const originalClickHandler = card.onclick;
            card.onclick = null;
            
            card.addEventListener('click', function(e) {
                // Se o clique foi no checkbox, não faz nada
                if (e.target === checkbox) {
                    return;
                }
                
                // Caso contrário, executa o comportamento original
                // Adiciona feedback visual ao clicar
                this.classList.add('card-selected');
                setTimeout(() => {
                    // Remove seleção de todos os cards
                    document.querySelectorAll('.item-card').forEach(c => c.classList.remove('card-selected'));
                    
                    // Armazena o produto selecionado
                    const produtos = JSON.parse(localStorage.getItem('produtos') || '[]');
                    const produto = produtos.find(p => p.id === this.dataset.id);
                    localStorage.setItem('selectedProduto', JSON.stringify(produto));
                    
                    // Avança para o próximo passo
                    document.querySelectorAll('.content-section').forEach(section => {
                        section.style.display = 'none';
                    });
                    document.getElementById('imprimir-etiqueta-section').style.display = 'block';
                    
                    // Atualiza a pré-visualização da etiqueta
                    updateEtiquetaPreview(produto);
                }, 300);
            });
            
            // Adiciona o checkbox ao card
            card.appendChild(checkbox);
        });
        
        // Atualiza o contador
        atualizarContadorProdutos();
    };
}

// Função para imprimir os produtos selecionados em grupo
function imprimirProdutosEmGrupo() {
    // Obtém o responsável selecionado
    const responsavel = JSON.parse(localStorage.getItem('selectedResponsavel') || '{}');
    
    // Verifica se há um responsável selecionado
    if (!responsavel.id) {
        mostrarMensagemErro('Selecione um responsável antes de imprimir.');
        return;
    }
    
    // Quantidade padrão para cada etiqueta
    const quantidade = 1;
    
    // Contador de etiquetas impressas
    let etiquetasImpressas = 0;
    
    // Imprime cada produto selecionado
    produtosSelecionados.forEach(produto => {
        // Data de manipulação (agora)
        const now = new Date();
        const dataManipulacao = now.toISOString();
        
        // Calcula a data de validade
        const validadeDate = new Date(now);
        validadeDate.setDate(validadeDate.getDate() + (produto.validade || 1));
        const dataValidade = validadeDate.toISOString();
        
        // Cria o objeto da etiqueta
        const etiqueta = {
            produto,
            responsavel,
            dataManipulacao,
            dataValidade,
            quantidade,
            medida: {
                valor: '0',
                unidade: 'g'
            },
            validadeOriginal: '',
            sif: '',
            lote: '',
            status: 'ativa' // ativa, excluida
        };
        
        // Adiciona a etiqueta ao banco de dados
        const etiquetaSalva = addEtiqueta(etiqueta);
        
        // Formata as datas para exibição no formato brasileiro
        const manipulacaoFormatada = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
        const validadeFormatada = `${validadeDate.getDate().toString().padStart(2, '0')}/${(validadeDate.getMonth() + 1).toString().padStart(2, '0')}/${validadeDate.getFullYear()}`;
        
        // Prepara os dados da etiqueta
        const etiquetaData = prepareEtiquetaData(produto, responsavel, manipulacaoFormatada, validadeFormatada);
        
        // Imprime a etiqueta usando a função do zebra-printer.js
        if (typeof printZebraLabel === 'function') {
            printZebraLabel(etiquetaSalva, etiquetaData, quantidade);
            etiquetasImpressas += quantidade;
        }
    });
    
    // Exibe mensagem de sucesso
    if (etiquetasImpressas > 0) {
        mostrarMensagemSucesso(`${etiquetasImpressas} etiqueta(s) enviada(s) para impressão com sucesso!`);
        
        // Limpa a lista de produtos selecionados
        produtosSelecionados = [];
        atualizarContadorProdutos();
        
        // Volta para a tela inicial após um breve delay
        setTimeout(() => {
            document.getElementById('nav-inicio').click();
        }, 1500);
    } else {
        mostrarMensagemErro('Erro ao imprimir etiquetas. Verifique se a impressora está conectada.');
    }
}

// Inicializa a funcionalidade quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa a impressão em grupo
    initImpressaoGrupo();
    
    // Adiciona checkboxes aos cards de produtos
    adicionarCheckboxesProdutos();
    
    // Modifica a função loadProdutos
    modificarLoadProdutos();
});