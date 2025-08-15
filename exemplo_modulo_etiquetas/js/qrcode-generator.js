/**
 * qrcode-generator.js - Geração de QR Codes para o Etiquetafy
 * Este script implementa as funcionalidades de geração de QR Codes para as etiquetas
 * utilizando a biblioteca QRCode.js
 */

// Função para gerar um QR Code a partir de dados
function generateQRCodeFromData(data, element, options = {}) {
    // Verifica se a biblioteca QRCode está disponível
    if (!window.QRCode) {
        console.error('Biblioteca QRCode.js não encontrada');
        return null;
    }
    
    // Verifica se o elemento existe
    const qrElement = document.getElementById(element);
    if (!qrElement) {
        console.error(`Elemento com ID ${element} não encontrado`);
        return null;
    }
    
    // Converte os dados para string JSON se for um objeto
    const qrText = typeof data === 'object' ? JSON.stringify(data) : data.toString();
    
    // Opções padrão
    const defaultOptions = {
        width: 128,
        height: 128,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    };
    
    // Mescla as opções padrão com as opções fornecidas
    const qrOptions = { ...defaultOptions, ...options };
    
    // Limpa o elemento
    qrElement.innerHTML = '';
    
    // Gera o QR Code
    try {
        new QRCode(qrElement, {
            text: qrText,
            width: qrOptions.width,
            height: qrOptions.height,
            colorDark: qrOptions.colorDark,
            colorLight: qrOptions.colorLight,
            correctLevel: qrOptions.correctLevel
        });
        
        return qrText;
    } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
        return null;
    }
}

// Função para ler um QR Code a partir de uma imagem
// Esta função seria implementada com uma biblioteca de leitura de QR Code
// como a jsQR ou a instascan, mas para fins de demonstração, apenas simula a leitura
function readQRCode(imageElement) {
    // Em um ambiente real, aqui seria feita a leitura do QR Code
    // Para fins de demonstração, retorna um objeto simulado
    console.log('Simulando leitura de QR Code...');
    
    // Simula um atraso na leitura
    return new Promise((resolve) => {
        setTimeout(() => {
            // Dados simulados de uma etiqueta
            const qrData = {
                id: '123456789',
                produto: {
                    id: 'prod123',
                    nome: 'Produto de Teste'
                },
                responsavel: {
                    id: 'resp456',
                    nome: 'Responsável de Teste'
                },
                dataManipulacao: '01/01/2025 - 10:00',
                dataValidade: '10/01/2025 - 10:00'
            };
            
            resolve(qrData);
        }, 1000);
    });
}

// Função para iniciar a leitura de QR Code com a câmera
// Esta função seria implementada com uma biblioteca como a instascan
// mas para fins de demonstração, apenas simula a leitura
function startQRCodeScanner(videoElement, callback) {
    // Verifica se o elemento existe
    const videoEl = document.getElementById(videoElement);
    if (!videoEl) {
        console.error(`Elemento de vídeo com ID ${videoElement} não encontrado`);
        return false;
    }
    
    // Em um ambiente real, aqui seria iniciada a câmera e a leitura do QR Code
    // Para fins de demonstração, apenas simula a leitura após um tempo
    console.log('Iniciando scanner de QR Code...');
    
    // Simula um vídeo da câmera
    videoEl.style.backgroundColor = '#333';
    videoEl.style.width = '100%';
    videoEl.style.height = '300px';
    
    // Adiciona um texto indicando que o scanner está ativo
    const scannerText = document.createElement('div');
    scannerText.style.color = '#fff';
    scannerText.style.textAlign = 'center';
    scannerText.style.padding = '20px';
    scannerText.textContent = 'Scanner de QR Code ativo. Aponte para uma etiqueta.';
    
    // Limpa o elemento de vídeo e adiciona o texto
    videoEl.innerHTML = '';
    videoEl.appendChild(scannerText);
    
    // Simula a leitura de um QR Code após 3 segundos
    setTimeout(() => {
        // Dados simulados de uma etiqueta
        const qrData = {
            id: '987654321',
            produto: {
                id: 'prod789',
                nome: 'Produto Escaneado'
            },
            responsavel: {
                id: 'resp123',
                nome: 'Responsável Escaneado'
            },
            dataManipulacao: '05/01/2025 - 15:30',
            dataValidade: '15/01/2025 - 15:30'
        };
        
        // Chama o callback com os dados lidos
        if (typeof callback === 'function') {
            callback(qrData);
        }
        
        // Adiciona um texto indicando que o QR Code foi lido
        scannerText.textContent = 'QR Code lido com sucesso!';
        
        // Simula o fechamento do scanner após 2 segundos
        setTimeout(() => {
            videoEl.innerHTML = '';
            videoEl.style.backgroundColor = 'transparent';
        }, 2000);
    }, 3000);
    
    return true;
}

// Função para parar o scanner de QR Code
function stopQRCodeScanner() {
    // Em um ambiente real, aqui seria parado o scanner
    // Para fins de demonstração, apenas exibe uma mensagem no console
    console.log('Scanner de QR Code parado.');
    return true;
}

// Função para gerar um QR Code para contagem de estoque
function generateStockCountQRCode(produto, quantidade, element) {
    // Dados para o QR Code
    const qrData = {
        tipo: 'contagem',
        produto: {
            id: produto.id,
            nome: produto.nome
        },
        quantidade,
        timestamp: new Date().toISOString()
    };
    
    // Gera o QR Code
    return generateQRCodeFromData(qrData, element);
}

// Inicializa os eventos relacionados aos QR Codes quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa os elementos de QR Code na página, se houver
    const qrElements = document.querySelectorAll('[data-qrcode]');
    
    qrElements.forEach(element => {
        const data = element.getAttribute('data-qrcode');
        if (data) {
            generateQRCodeFromData(data, element.id);
        }
    });
});