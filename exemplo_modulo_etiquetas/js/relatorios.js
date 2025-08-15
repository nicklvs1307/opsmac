/**
 * relatorios.js - Geração de relatórios para o Etiquetafy
 * Este script implementa as funcionalidades de geração e visualização de relatórios
 * utilizando os dados armazenados no localStorage
 */

// Função para gerar relatório de etiquetas
function gerarRelatorioEtiquetas(dataInicio, dataFim, funcionarioId) {
    // Obtém as etiquetas
    let etiquetas = [];
    
    if (typeof getEtiquetas === 'function') {
        etiquetas = getEtiquetas();
    } else {
        etiquetas = JSON.parse(localStorage.getItem('etiquetas') || '[]');
    }
    
    // Filtra por data
    if (dataInicio || dataFim) {
        const inicio = dataInicio ? new Date(dataInicio) : new Date(0); // Data mínima
        const fim = dataFim ? new Date(dataFim) : new Date(8640000000000000); // Data máxima
        
        etiquetas = etiquetas.filter(e => {
            const dataManipulacao = new Date(e.dataManipulacao);
            return dataManipulacao >= inicio && dataManipulacao <= fim;
        });
    }
    
    // Filtra por funcionário
    if (funcionarioId) {
        etiquetas = etiquetas.filter(e => 
            e.responsavel && e.responsavel.id === funcionarioId
        );
    }
    
    // Prepara os dados do relatório
    const produtosMap = {};
    const funcionariosMap = {};
    
    etiquetas.forEach(etiqueta => {
        // Contagem por produto
        if (etiqueta.produto && etiqueta.produto.id) {
            if (!produtosMap[etiqueta.produto.id]) {
                produtosMap[etiqueta.produto.id] = {
                    nome: etiqueta.produto.nome,
                    quantidade: 0
                };
            }
            produtosMap[etiqueta.produto.id].quantidade += etiqueta.quantidade || 1;
        }
        
        // Contagem por funcionário
        if (etiqueta.responsavel && etiqueta.responsavel.id) {
            if (!funcionariosMap[etiqueta.responsavel.id]) {
                funcionariosMap[etiqueta.responsavel.id] = {
                    nome: etiqueta.responsavel.nome,
                    quantidade: 0
                };
            }
            funcionariosMap[etiqueta.responsavel.id].quantidade += etiqueta.quantidade || 1;
        }
    });
    
    // Prepara o resultado
    return {
        total: etiquetas.length,
        totalProdutos: Object.keys(produtosMap).length,
        totalFuncionarios: Object.keys(funcionariosMap).length,
        etiquetas,
        produtosMap,
        funcionariosMap
    };
}

// Função para gerar relatório de produção
function gerarRelatorioProducao(dataInicio, dataFim, funcionarioId) {
    // Obtém os registros de produção
    let registros = [];
    
    if (typeof getProducao === 'function') {
        registros = getProducao();
    } else {
        registros = JSON.parse(localStorage.getItem('producao') || '[]');
    }
    
    // Filtra por data
    if (dataInicio || dataFim) {
        const inicio = dataInicio ? new Date(dataInicio) : new Date(0); // Data mínima
        const fim = dataFim ? new Date(dataFim) : new Date(8640000000000000); // Data máxima
        
        registros = registros.filter(r => {
            const data = new Date(r.data);
            return data >= inicio && data <= fim;
        });
    }
    
    // Filtra por funcionário
    if (funcionarioId) {
        registros = registros.filter(r => 
            r.responsavel && r.responsavel.id === funcionarioId
        );
    }
    
    // Prepara os dados do relatório
    const produtosMap = {};
    const funcionariosMap = {};
    const insumosMap = {};
    
    registros.forEach(registro => {
        // Contagem por produto
        if (registro.produtoId) {
            if (!produtosMap[registro.produtoId]) {
                // Busca o nome do produto
                const produtos = JSON.parse(localStorage.getItem('produtos') || '[]');
                const produto = produtos.find(p => p.id === registro.produtoId);
                
                produtosMap[registro.produtoId] = {
                    nome: produto ? produto.nome : 'Produto não encontrado',
                    quantidade: 0
                };
            }
            produtosMap[registro.produtoId].quantidade += registro.quantidade || 0;
        }
        
        // Contagem por funcionário
        if (registro.responsavel && registro.responsavel.id) {
            if (!funcionariosMap[registro.responsavel.id]) {
                funcionariosMap[registro.responsavel.id] = {
                    nome: registro.responsavel.nome,
                    quantidade: 0
                };
            }
            funcionariosMap[registro.responsavel.id].quantidade += registro.quantidade || 0;
        }
        
        // Contagem por insumo
        if (registro.insumos && Array.isArray(registro.insumos)) {
            registro.insumos.forEach(insumo => {
                if (insumo.produtoId) {
                    if (!insumosMap[insumo.produtoId]) {
                        // Busca o nome do produto
                        const produtos = JSON.parse(localStorage.getItem('produtos') || '[]');
                        const produto = produtos.find(p => p.id === insumo.produtoId);
                        
                        insumosMap[insumo.produtoId] = {
                            nome: produto ? produto.nome : 'Produto não encontrado',
                            quantidade: 0
                        };
                    }
                    insumosMap[insumo.produtoId].quantidade += insumo.quantidade || 0;
                }
            });
        }
    });
    
    // Prepara o resultado
    return {
        total: registros.length,
        totalProdutos: Object.keys(produtosMap).length,
        totalFuncionarios: Object.keys(funcionariosMap).length,
        registros,
        produtosMap,
        funcionariosMap,
        insumosMap
    };
}

// Função para gerar relatório de contagem de estoque
function gerarRelatorioContagem(dataInicio, dataFim, funcionarioId) {
    // Obtém as contagens
    let contagens = [];
    
    if (typeof getContagens === 'function') {
        contagens = getContagens();
    } else {
        contagens = JSON.parse(localStorage.getItem('contagens') || '[]');
    }
    
    // Filtra por data
    if (dataInicio || dataFim) {
        const inicio = dataInicio ? new Date(dataInicio) : new Date(0); // Data mínima
        const fim = dataFim ? new Date(dataFim) : new Date(8640000000000000); // Data máxima
        
        contagens = contagens.filter(c => {
            const data = new Date(c.timestamp);
            return data >= inicio && data <= fim;
        });
    }
    
    // Filtra por funcionário
    if (funcionarioId) {
        contagens = contagens.filter(c => 
            c.responsavel && c.responsavel.id === funcionarioId
        );
    }
    
    // Prepara os dados do relatório
    const produtosMap = {};
    const funcionariosMap = {};
    
    contagens.forEach(contagem => {
        // Contagem por produto
        if (contagem.produto && contagem.produto.id) {
            if (!produtosMap[contagem.produto.id]) {
                produtosMap[contagem.produto.id] = {
                    nome: contagem.produto.nome,
                    quantidade: 0,
                    ajustes: 0
                };
            }
            produtosMap[contagem.produto.id].quantidade += contagem.quantidade || 0;
            if (contagem.ajustarEstoque) {
                produtosMap[contagem.produto.id].ajustes += 1;
            }
        }
        
        // Contagem por funcionário
        if (contagem.responsavel && contagem.responsavel.id) {
            if (!funcionariosMap[contagem.responsavel.id]) {
                funcionariosMap[contagem.responsavel.id] = {
                    nome: contagem.responsavel.nome,
                    quantidade: 0,
                    ajustes: 0
                };
            }
            funcionariosMap[contagem.responsavel.id].quantidade += 1;
            if (contagem.ajustarEstoque) {
                funcionariosMap[contagem.responsavel.id].ajustes += 1;
            }
        }
    });
    
    // Prepara o resultado
    return {
        total: contagens.length,
        totalProdutos: Object.keys(produtosMap).length,
        totalFuncionarios: Object.keys(funcionariosMap).length,
        contagens,
        produtosMap,
        funcionariosMap
    };
}

// Função para exibir o relatório na interface
function exibirRelatorio(tipo, dataInicio, dataFim, funcionarioId) {
    // Gera o relatório conforme o tipo
    let relatorio;
    switch (tipo) {
        case 'etiquetas':
            relatorio = gerarRelatorioEtiquetas(dataInicio, dataFim, funcionarioId);
            break;
        case 'producao':
            relatorio = gerarRelatorioProducao(dataInicio, dataFim, funcionarioId);
            break;
        case 'contagem':
            relatorio = gerarRelatorioContagem(dataInicio, dataFim, funcionarioId);
            break;
        default:
            relatorio = gerarRelatorioEtiquetas(dataInicio, dataFim, funcionarioId);
    }
    
    // Atualiza os totais
    document.getElementById('total-etiquetas').textContent = relatorio.total;
    document.getElementById('total-produtos').textContent = relatorio.totalProdutos;
    document.getElementById('total-funcionarios').textContent = relatorio.totalFuncionarios;
    
    // Configura a tabela conforme o tipo de relatório
    const thead = document.querySelector('#relatorio-table thead tr');
    const tbody = document.querySelector('#relatorio-table tbody');
    
    if (!thead || !tbody) return;
    
    // Limpa a tabela
    thead.innerHTML = '';
    tbody.innerHTML = '';
    
    // Configura os cabeçalhos e dados conforme o tipo
    switch (tipo) {
        case 'etiquetas':
            // Cabeçalhos
            thead.innerHTML = `
                <th>Produto</th>
                <th>Responsável</th>
                <th>Data de Manipulação</th>
                <th>Data de Validade</th>
                <th>Quantidade</th>
            `;
            
            // Dados
            relatorio.etiquetas.forEach(etiqueta => {
                const tr = document.createElement('tr');
                
                // Formata as datas
                const dataManipulacao = new Date(etiqueta.dataManipulacao);
                const dataValidade = new Date(etiqueta.dataValidade);
                
                const manipulacaoFormatada = `${dataManipulacao.getDate().toString().padStart(2, '0')}/${(dataManipulacao.getMonth() + 1).toString().padStart(2, '0')}/${dataManipulacao.getFullYear()}`;
                const validadeFormatada = `${dataValidade.getDate().toString().padStart(2, '0')}/${(dataValidade.getMonth() + 1).toString().padStart(2, '0')}/${dataValidade.getFullYear()}`;
                
                tr.innerHTML = `
                    <td>${etiqueta.produto ? etiqueta.produto.nome : '-'}</td>
                    <td>${etiqueta.responsavel ? etiqueta.responsavel.nome : '-'}</td>
                    <td>${manipulacaoFormatada}</td>
                    <td>${validadeFormatada}</td>
                    <td>${etiqueta.quantidade || 1}</td>
                `;
                
                tbody.appendChild(tr);
            });
            break;
            
        case 'producao':
            // Cabeçalhos
            thead.innerHTML = `
                <th>Produto</th>
                <th>Responsável</th>
                <th>Data</th>
                <th>Quantidade</th>
                <th>Insumos</th>
            `;
            
            // Dados
            relatorio.registros.forEach(registro => {
                const tr = document.createElement('tr');
                
                // Formata a data
                const data = new Date(registro.data);
                const dataFormatada = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}`;
                
                // Busca o nome do produto
                const produtos = JSON.parse(localStorage.getItem('produtos') || '[]');
                const produto = produtos.find(p => p.id === registro.produtoId);
                const produtoNome = produto ? produto.nome : 'Produto não encontrado';
                
                // Formata os insumos
                let insumosTexto = '';
                if (registro.insumos && Array.isArray(registro.insumos)) {
                    insumosTexto = registro.insumos.map(insumo => {
                        const insumoProduto = produtos.find(p => p.id === insumo.produtoId);
                        return `${insumoProduto ? insumoProduto.nome : 'Insumo não encontrado'} (${insumo.quantidade})`;
                    }).join(', ');
                }
                
                tr.innerHTML = `
                    <td>${produtoNome}</td>
                    <td>${registro.responsavel ? registro.responsavel.nome : '-'}</td>
                    <td>${dataFormatada}</td>
                    <td>${registro.quantidade}</td>
                    <td>${insumosTexto || '-'}</td>
                `;
                
                tbody.appendChild(tr);
            });
            break;
            
        case 'contagem':
            // Cabeçalhos
            thead.innerHTML = `
                <th>Produto</th>
                <th>Responsável</th>
                <th>Data</th>
                <th>Quantidade</th>
                <th>Ajuste</th>
                <th>Observação</th>
            `;
            
            // Dados
            relatorio.contagens.forEach(contagem => {
                const tr = document.createElement('tr');
                
                // Formata a data
                const data = new Date(contagem.timestamp);
                const dataFormatada = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()} ${data.getHours().toString().padStart(2, '0')}:${data.getMinutes().toString().padStart(2, '0')}`;
                
                tr.innerHTML = `
                    <td>${contagem.produto ? contagem.produto.nome : '-'}</td>
                    <td>${contagem.responsavel ? contagem.responsavel.nome : '-'}</td>
                    <td>${dataFormatada}</td>
                    <td>${contagem.quantidade}</td>
                    <td>${contagem.ajustarEstoque ? 'Sim' : 'Não'}</td>
                    <td>${contagem.observacao || '-'}</td>
                `;
                
                tbody.appendChild(tr);
            });
            break;
    }
}

// Função para carregar os funcionários no select de relatórios
function carregarFuncionariosRelatorio() {
    const select = document.getElementById('relatorio-funcionario');
    if (!select) return;
    
    // Limpa as opções existentes, mantendo a opção "Todos"
    select.innerHTML = '<option value="">Todos</option>';
    
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

// Inicializa os eventos relacionados aos relatórios quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Carrega os funcionários no select quando a seção de relatórios for exibida
    const navRelatorios = document.getElementById('nav-relatorios');
    if (navRelatorios) {
        navRelatorios.addEventListener('click', function() {
            carregarFuncionariosRelatorio();
            
            // Define a data atual como data fim
            const hoje = new Date();
            const dataFormatada = `${hoje.getFullYear()}-${(hoje.getMonth() + 1).toString().padStart(2, '0')}-${hoje.getDate().toString().padStart(2, '0')}`;
            document.getElementById('relatorio-data-fim').value = dataFormatada;
            
            // Define a data de 30 dias atrás como data início
            const dataInicio = new Date(hoje);
            dataInicio.setDate(dataInicio.getDate() - 30);
            const dataInicioFormatada = `${dataInicio.getFullYear()}-${(dataInicio.getMonth() + 1).toString().padStart(2, '0')}-${dataInicio.getDate().toString().padStart(2, '0')}`;
            document.getElementById('relatorio-data-inicio').value = dataInicioFormatada;
            
            // Gera o relatório inicial
            const tipo = document.getElementById('relatorio-tipo').value;
            exibirRelatorio(tipo, dataInicioFormatada, dataFormatada, '');
        });
    }
    
    // Botão para gerar relatório
    const btnGerarRelatorio = document.getElementById('btn-gerar-relatorio');
    if (btnGerarRelatorio) {
        btnGerarRelatorio.addEventListener('click', function() {
            const tipo = document.getElementById('relatorio-tipo').value;
            const dataInicio = document.getElementById('relatorio-data-inicio').value;
            const dataFim = document.getElementById('relatorio-data-fim').value;
            const funcionarioId = document.getElementById('relatorio-funcionario').value;
            
            exibirRelatorio(tipo, dataInicio, dataFim, funcionarioId);
        });
    }
    
    // Evento de mudança no tipo de relatório
    const tipoRelatorio = document.getElementById('relatorio-tipo');
    if (tipoRelatorio) {
        tipoRelatorio.addEventListener('change', function() {
            const tipo = this.value;
            const dataInicio = document.getElementById('relatorio-data-inicio').value;
            const dataFim = document.getElementById('relatorio-data-fim').value;
            const funcionarioId = document.getElementById('relatorio-funcionario').value;
            
            exibirRelatorio(tipo, dataInicio, dataFim, funcionarioId);
        });
    }
});