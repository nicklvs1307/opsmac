/**
 * etiqueta-manager.js - Gerenciamento de etiquetas para o Etiquetafy
 * Este script implementa as funcionalidades de geração, impressão e gerenciamento de etiquetas
 * utilizando localStorage como banco de dados local
 */

// Inicialização do banco de dados local
function initEtiquetasDatabase() {
    // Verifica se já existe a lista de etiquetas no localStorage
    if (!localStorage.getItem('etiquetas')) {
        // Inicializa com uma lista vazia
        localStorage.setItem('etiquetas', JSON.stringify([]));
    }
}

// Função para obter todas as etiquetas
function getEtiquetas() {
    return JSON.parse(localStorage.getItem('etiquetas') || '[]');
}

// Função para adicionar uma nova etiqueta
function addEtiqueta(etiqueta) {
    const etiquetas = getEtiquetas();
    
    // Gera um ID único para a etiqueta
    etiqueta.id = Date.now().toString();
    
    // Define a data atual se não for fornecida
    if (!etiqueta.dataManipulacao) {
        const dataAtual = new Date();
        etiqueta.dataManipulacao = dataAtual.toISOString();
    }
    
    // Calcula a data de validade se não for fornecida
    if (!etiqueta.dataValidade && etiqueta.produto && etiqueta.produto.validade) {
        const dataManipulacao = new Date(etiqueta.dataManipulacao);
        const dataValidade = new Date(dataManipulacao);
        dataValidade.setDate(dataValidade.getDate() + etiqueta.produto.validade);
        etiqueta.dataValidade = dataValidade.toISOString();
    }
    
    etiquetas.push(etiqueta);
    localStorage.setItem('etiquetas', JSON.stringify(etiquetas));
    
    return etiqueta;
}

// Função para atualizar uma etiqueta existente
function updateEtiqueta(id, dadosAtualizados) {
    const etiquetas = getEtiquetas();
    const index = etiquetas.findIndex(e => e.id === id);
    
    if (index !== -1) {
        etiquetas[index] = { ...etiquetas[index], ...dadosAtualizados };
        localStorage.setItem('etiquetas', JSON.stringify(etiquetas));
        return etiquetas[index];
    }
    
    return null;
}

// Função para excluir uma etiqueta
function deleteEtiqueta(id) {
    const etiquetas = getEtiquetas();
    const novaLista = etiquetas.filter(e => e.id !== id);
    localStorage.setItem('etiquetas', JSON.stringify(novaLista));
    return true;
}

// Função para buscar uma etiqueta pelo ID
function getEtiquetaById(id) {
    const etiquetas = getEtiquetas();
    return etiquetas.find(e => e.id === id) || null;
}

// Função para buscar etiquetas por produto (pesquisa parcial)
function searchEtiquetas(termo) {
    if (!termo) return getEtiquetas();
    
    const etiquetas = getEtiquetas();
    const termoLower = termo.toLowerCase();
    
    return etiquetas.filter(e => 
        (e.produto && e.produto.nome && e.produto.nome.toLowerCase().includes(termoLower)) ||
        (e.responsavel && e.responsavel.nome && e.responsavel.nome.toLowerCase().includes(termoLower))
    );
}

// Função para buscar etiquetas por data de validade
function getEtiquetasByValidade(dataInicio, dataFim) {
    const etiquetas = getEtiquetas();
    
    // Se não houver datas, retorna todas as etiquetas
    if (!dataInicio && !dataFim) return etiquetas;
    
    // Converte as datas para objetos Date
    const inicio = dataInicio ? new Date(dataInicio) : new Date(0); // Data mínima
    const fim = dataFim ? new Date(dataFim) : new Date(8640000000000000); // Data máxima
    
    return etiquetas.filter(e => {
        const dataValidade = new Date(e.dataValidade);
        return dataValidade >= inicio && dataValidade <= fim;
    });
}

// Função para agrupar etiquetas por data de validade
function groupEtiquetasByValidade() {
    const etiquetas = getEtiquetas();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Início do dia atual
    
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);
    
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);
    
    const grupos = {
        vencidas: [], // Antes de ontem
        ontem: [],    // Ontem
        hoje: [],     // Hoje
        amanha: [],   // Amanhã
        futuras: []   // Depois de amanhã
    };
    
    etiquetas.forEach(etiqueta => {
        const dataValidade = new Date(etiqueta.dataValidade);
        dataValidade.setHours(0, 0, 0, 0); // Início do dia da validade
        
        if (dataValidade < ontem) {
            grupos.vencidas.push(etiqueta);
        } else if (dataValidade.getTime() === ontem.getTime()) {
            grupos.ontem.push(etiqueta);
        } else if (dataValidade.getTime() === hoje.getTime()) {
            grupos.hoje.push(etiqueta);
        } else if (dataValidade.getTime() === amanha.getTime()) {
            grupos.amanha.push(etiqueta);
        } else {
            grupos.futuras.push(etiqueta);
        }
    });
    
    return grupos;
}

// Função para preparar os dados da etiqueta (substituindo a antiga função de QR Code)
function prepareEtiquetaData(produto, responsavel, dataManipulacao, dataValidade) {
    // Dados para a etiqueta
    const etiquetaData = {
        id: Date.now().toString(),
        produto: {
            id: produto.id,
            nome: produto.nome
        },
        responsavel: {
            id: responsavel.id,
            nome: responsavel.nome
        },
        dataManipulacao,
        dataValidade
    };
    
    return etiquetaData;
}

// Função para imprimir a etiqueta
function imprimirEtiqueta() {
    // Obtém os dados da etiqueta
    const produto = JSON.parse(localStorage.getItem('selectedProduto') || '{}');
    const responsavel = JSON.parse(localStorage.getItem('selectedResponsavel') || '{}');
    const quantidade = parseInt(document.getElementById('quantity').value || '1');
    
    // Obtém os dados adicionais
    const medidaValor = document.getElementById('medida-valor').value || '0';
    const medidaUnidade = document.getElementById('medida-unidade').value || 'g';
    const validadeOriginal = document.getElementById('validade-original').value || '';
    const sif = document.getElementById('sif').value || '';
    const lote = document.getElementById('lote').value || '';
    
    // Data de manipulação (agora)
    const now = new Date();
    const dataManipulacao = now.toISOString();
    
    // Calcula a data de validade
    const validadeDate = new Date(now);
    validadeDate.setDate(validadeDate.getDate() + (produto.validade || 1));
    const dataValidade = validadeDate.toISOString();
    
    // Formata as datas para exibição no formato brasileiro
    const manipulacaoFormatada = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    const validadeFormatada = `${validadeDate.getDate().toString().padStart(2, '0')}/${(validadeDate.getMonth() + 1).toString().padStart(2, '0')}/${validadeDate.getFullYear()}`;
    
    // Cria o objeto da etiqueta
    const etiqueta = {
        produto,
        responsavel,
        dataManipulacao,
        dataValidade,
        quantidade,
        medida: {
            valor: medidaValor,
            unidade: medidaUnidade
        },
        validadeOriginal,
        sif,
        lote,
        status: 'ativa' // ativa, excluida
    };
    
    // Adiciona a etiqueta ao banco de dados
    const etiquetaSalva = addEtiqueta(etiqueta);
    
    // Prepara os dados da etiqueta
    const etiquetaData = prepareEtiquetaData(produto, responsavel, manipulacaoFormatada, validadeFormatada);
    
    // Imprime a etiqueta usando a função do zebra-printer.js
    if (typeof printZebraLabel === 'function') {
        printZebraLabel(etiquetaSalva, etiquetaData, quantidade);
        
        // Exibe mensagem de sucesso com estilo melhorado
        const mensagem = `${quantidade} etiqueta(s) enviada(s) para impressão com sucesso!`;
        mostrarMensagemSucesso(mensagem);
        
        // Volta para a tela inicial após um breve delay
        setTimeout(() => {
            document.getElementById('nav-inicio').click();
        }, 1500);
    } else {
        console.error('Função printZebraLabel não encontrada');
        mostrarMensagemErro('Erro ao imprimir etiqueta. Verifique se a impressora está conectada.');
    }
}

// Função para mostrar mensagem de sucesso
function mostrarMensagemSucesso(mensagem) {
    // Verifica se já existe um elemento de mensagem
    let mensagemElement = document.getElementById('mensagem-feedback');
    
    // Se não existir, cria um novo
    if (!mensagemElement) {
        mensagemElement = document.createElement('div');
        mensagemElement.id = 'mensagem-feedback';
        document.body.appendChild(mensagemElement);
    }
    
    // Configura o estilo e conteúdo
    mensagemElement.className = 'mensagem-sucesso';
    mensagemElement.innerHTML = `<i class="fas fa-check-circle"></i> ${mensagem}`;
    mensagemElement.style.display = 'flex';
    
    // Adiciona estilos inline para garantir a exibição correta
    Object.assign(mensagemElement.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '15px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: '9999',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '500',
        fontSize: '15px',
        animation: 'fadeInOut 3s forwards'
    });
    
    // Adiciona a animação se ainda não existir
    if (!document.getElementById('mensagem-animation-style')) {
        const style = document.createElement('style');
        style.id = 'mensagem-animation-style';
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateY(-20px); }
                10% { opacity: 1; transform: translateY(0); }
                90% { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(-20px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Remove a mensagem após 3 segundos
    setTimeout(() => {
        mensagemElement.style.display = 'none';
    }, 3000);
}

// Função para mostrar mensagem de erro
function mostrarMensagemErro(mensagem) {
    // Verifica se já existe um elemento de mensagem
    let mensagemElement = document.getElementById('mensagem-feedback');
    
    // Se não existir, cria um novo
    if (!mensagemElement) {
        mensagemElement = document.createElement('div');
        mensagemElement.id = 'mensagem-feedback';
        document.body.appendChild(mensagemElement);
    }
    
    // Configura o estilo e conteúdo
    mensagemElement.className = 'mensagem-erro';
    mensagemElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${mensagem}`;
    mensagemElement.style.display = 'flex';
    
    // Adiciona estilos inline para garantir a exibição correta
    Object.assign(mensagemElement.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: '#E53E3E',
        color: 'white',
        padding: '15px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: '9999',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '500',
        fontSize: '15px',
        animation: 'fadeInOut 3s forwards'
    });
    
    // Adiciona a animação se ainda não existir
    if (!document.getElementById('mensagem-animation-style')) {
        const style = document.createElement('style');
        style.id = 'mensagem-animation-style';
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateY(-20px); }
                10% { opacity: 1; transform: translateY(0); }
                90% { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(-20px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Remove a mensagem após 3 segundos
    setTimeout(() => {
        mensagemElement.style.display = 'none';
    }, 3000);
}

// Função para carregar e exibir as etiquetas por validade
function loadEtiquetasByValidade() {
    // Agrupa as etiquetas por data de validade
    const grupos = groupEtiquetasByValidade();
    
    // Atualiza os contadores nos cards
    document.querySelectorAll('.validade-card').forEach(card => {
        const periodo = card.querySelector('p').textContent.toLowerCase();
        let count = 0;
        
        switch (periodo) {
            case 'ontem':
                count = grupos.ontem.length;
                break;
            case 'hoje':
                count = grupos.hoje.length;
                break;
            case 'amanhã':
                count = grupos.amanha.length;
                break;
            default:
                count = 0;
        }
        
        const countElement = card.querySelector('.count');
        if (countElement) {
            countElement.textContent = count;
        }
    });
    
    // Implementar a exibição detalhada das etiquetas por validade
    // Será implementado quando a tabela/lista for adicionada ao HTML
}

// Função para excluir etiquetas vencidas
function excluirEtiquetasVencidas() {
    // Agrupa as etiquetas por data de validade
    const grupos = groupEtiquetasByValidade();
    
    // Etiquetas a serem excluídas (vencidas e de ontem)
    const etiquetasParaExcluir = [...grupos.vencidas, ...grupos.ontem];
    
    if (etiquetasParaExcluir.length === 0) {
        mostrarMensagemErro('Não há etiquetas vencidas para excluir.');
        return;
    }
    
    // Confirma a exclusão
    if (confirm(`Deseja excluir ${etiquetasParaExcluir.length} etiqueta(s) vencida(s)?`)) {
        // Exclui cada etiqueta
        etiquetasParaExcluir.forEach(etiqueta => {
            deleteEtiqueta(etiqueta.id);
        });
        
        // Atualiza a exibição
        loadEtiquetasByValidade();
        
        mostrarMensagemSucesso(`${etiquetasParaExcluir.length} etiqueta(s) excluída(s) com sucesso!`);
    }
}

// Função para excluir uma etiqueta específica
function excluirEtiqueta(id) {
    // Confirma a exclusão
    if (confirm('Deseja realmente excluir esta etiqueta?')) {
        // Exclui a etiqueta
        deleteEtiqueta(id);
        
        // Atualiza a exibição
        loadEtiquetasByValidade();
        
        // Exibe mensagem de sucesso
        mostrarMensagemSucesso('Etiqueta excluída com sucesso!');
    }
}

// Inicializa os eventos relacionados às etiquetas quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa o banco de dados de etiquetas
    initEtiquetasDatabase();
    
    // Botão para excluir etiquetas vencidas
    const btnExcluirEtiquetasValidade = document.getElementById('btn-excluir-etiquetas-validade');
    if (btnExcluirEtiquetasValidade) {
        btnExcluirEtiquetasValidade.addEventListener('click', excluirEtiquetasVencidas);
    }
    
    // Carrega as etiquetas por validade quando a seção for exibida
    const navValidades = document.getElementById('nav-validades');
    if (navValidades) {
        navValidades.addEventListener('click', function() {
            loadEtiquetasByValidade();
        });
    }
});