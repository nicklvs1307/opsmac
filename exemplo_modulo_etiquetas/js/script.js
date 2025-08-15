/**
 * script.js - Main script for Etiquetafy user interface
 * Handles navigation, UI interactions, and section visibility
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initUserInterface();
    
    // Check if user is logged in
    checkAuthentication();
    
    // Initialize databases
    initDatabases();
});

/**
 * Initialize navigation functionality
 */
function initNavigation() {
    // Navigation menu items
    const navItems = {
        'nav-inicio': 'inicio-section',
        'nav-etiquetas': 'etiquetas-section',
        'nav-validades': 'monitoria-validades-section',
        'nav-producao': 'producao-section',
        'nav-contagem-estoque': 'contagem-estoque-section',
        'nav-relatorios': 'relatorios-section'
    };
    
    // Add click event listeners to all navigation items
    Object.keys(navItems).forEach(navId => {
        const navElement = document.getElementById(navId);
        if (navElement) {
            navElement.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active class from all nav items
                Object.keys(navItems).forEach(id => {
                    document.getElementById(id).classList.remove('active');
                });
                
                // Add active class to clicked nav item
                this.classList.add('active');
                
                // Hide all sections
                document.querySelectorAll('.content-section').forEach(section => {
                    section.style.display = 'none';
                });
                
                // Show the corresponding section
                const sectionToShow = document.getElementById(navItems[navId]);
                if (sectionToShow) {
                    sectionToShow.style.display = 'block';
                    
                    // If it's the inicio section, also show the novos-servicos section
                    if (navId === 'nav-inicio') {
                        const novosServicosSection = document.getElementById('novos-servicos-section');
                        if (novosServicosSection) {
                            novosServicosSection.style.display = 'block';
                        }
                    }
                }
            });
        }
    });
    
    // Initialize buttons on the home page
    initHomeButtons();
}

/**
 * Initialize buttons on the home page
 */
function initHomeButtons() {
    // Button to start the printing process
    const btnFazerImpressao = document.getElementById('btn-fazer-impressao');
    if (btnFazerImpressao) {
        btnFazerImpressao.addEventListener('click', function() {
            // Add visual feedback on click
            this.classList.add('btn-clicked');
            setTimeout(() => this.classList.remove('btn-clicked'), 200);
            
            // Hide all sections
            document.querySelectorAll('.content-section').forEach(section => {
                section.style.display = 'none';
            });
            
            // Show the responsible person selection section
            const selecionarResponsavelSection = document.getElementById('selecionar-responsavel-section');
            if (selecionarResponsavelSection) {
                selecionarResponsavelSection.style.display = 'block';
                // Load responsible persons
                loadResponsaveis();
            }
        });
    }
    
    // Button to go to the exclusion of labels section
    const btnExclusaoEtiquetas = document.getElementById('btn-exclusao-etiquetas');
    if (btnExclusaoEtiquetas) {
        btnExclusaoEtiquetas.addEventListener('click', function() {
            // Add visual feedback on click
            this.classList.add('btn-clicked');
            setTimeout(() => this.classList.remove('btn-clicked'), 200);
            
            // Activate the validades nav item
            document.getElementById('nav-validades').click();
        });
    }
    
    // Button to go to the production section
    const btnVerProducao = document.getElementById('btn-ver-producao');
    if (btnVerProducao) {
        btnVerProducao.addEventListener('click', function() {
            // Add visual feedback on click
            this.classList.add('btn-clicked');
            setTimeout(() => this.classList.remove('btn-clicked'), 200);
            
            // Activate the producao nav item
            document.getElementById('nav-producao').click();
        });
    }
    
    // Button to start product counting
    const btnIniciarContagemHome = document.getElementById('btn-iniciar-contagem-home');
    if (btnIniciarContagemHome) {
        btnIniciarContagemHome.addEventListener('click', function() {
            // Add visual feedback on click
            this.classList.add('btn-clicked');
            setTimeout(() => this.classList.remove('btn-clicked'), 200);
            
            // Call the function to start product counting
            if (typeof iniciarContagemEstoque === 'function') {
                iniciarContagemEstoque();
            } else {
                console.error('Função iniciarContagemEstoque não encontrada');
            }
        });
    }
    
    // Button to view counting history
    const btnHistoricoContagensHome = document.getElementById('btn-historico-contagens-home');
    if (btnHistoricoContagensHome) {
        btnHistoricoContagensHome.addEventListener('click', function() {
            // Add visual feedback on click
            this.classList.add('btn-clicked');
            setTimeout(() => this.classList.remove('btn-clicked'), 200);
            
            // Call the function to show counting history
            if (typeof exibirHistoricoContagens === 'function') {
                exibirHistoricoContagens();
            } else {
                console.error('Função exibirHistoricoContagens não encontrada');
            }
        });
    }
}

/**
 * Initialize user interface components
 */
function initUserInterface() {
    // Initialize back buttons for the etiqueta flow
    initBackButtons();
    
    // Initialize the etiqueta preview
    initEtiquetaPreview();
}

/**
 * Initialize back buttons for the etiqueta flow
 */
function initBackButtons() {
    // Back to inicio from responsavel selection
    const voltarInicio1 = document.getElementById('voltar-inicio-1');
    if (voltarInicio1) {
        voltarInicio1.addEventListener('click', function() {
            // Add visual feedback on click
            this.classList.add('btn-clicked');
            setTimeout(() => this.classList.remove('btn-clicked'), 200);
            
            document.getElementById('nav-inicio').click();
        });
    }
    
    // Back to responsavel from grupo selection
    const voltarResponsavelBtn = document.getElementById('voltar-responsavel-btn');
    if (voltarResponsavelBtn) {
        voltarResponsavelBtn.addEventListener('click', function() {
            // Add visual feedback on click
            this.classList.add('btn-clicked');
            setTimeout(() => this.classList.remove('btn-clicked'), 200);
            
            document.querySelectorAll('.content-section').forEach(section => {
                section.style.display = 'none';
            });
            document.getElementById('selecionar-responsavel-section').style.display = 'block';
        });
    }
    
    // Back to grupo from produto selection
    const voltarGrupoBtn = document.getElementById('voltar-grupo-btn');
    if (voltarGrupoBtn) {
        voltarGrupoBtn.addEventListener('click', function() {
            // Add visual feedback on click
            this.classList.add('btn-clicked');
            setTimeout(() => this.classList.remove('btn-clicked'), 200);
            
            document.querySelectorAll('.content-section').forEach(section => {
                section.style.display = 'none';
            });
            document.getElementById('selecionar-grupo-section').style.display = 'block';
        });
    }
    
    // Back to produto from imprimir etiqueta
    const voltarProdutoBtn = document.getElementById('voltar-produto-btn');
    if (voltarProdutoBtn) {
        voltarProdutoBtn.addEventListener('click', function() {
            // Add visual feedback on click
            this.classList.add('btn-clicked');
            setTimeout(() => this.classList.remove('btn-clicked'), 200);
            
            document.querySelectorAll('.content-section').forEach(section => {
                section.style.display = 'none';
            });
            document.getElementById('selecionar-produto-section').style.display = 'block';
        });
    }
}

/**
 * Initialize etiqueta preview
 */
function initEtiquetaPreview() {
    // Quantity control buttons
    const decreaseQtyBtn = document.getElementById('decrease-qty');
    const increaseQtyBtn = document.getElementById('increase-qty');
    const quantityInput = document.getElementById('quantity');
    
    if (decreaseQtyBtn && increaseQtyBtn && quantityInput) {
        decreaseQtyBtn.addEventListener('click', function() {
            // Add visual feedback on click
            this.classList.add('btn-clicked');
            setTimeout(() => this.classList.remove('btn-clicked'), 200);
            
            const currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });
        
        increaseQtyBtn.addEventListener('click', function() {
            // Add visual feedback on click
            this.classList.add('btn-clicked');
            setTimeout(() => this.classList.remove('btn-clicked'), 200);
            
            const currentValue = parseInt(quantityInput.value);
            quantityInput.value = currentValue + 1;
        });
    }
    
    // Print button
    const imprimirFinalBtn = document.getElementById('imprimir-final-btn');
    if (imprimirFinalBtn) {
        imprimirFinalBtn.addEventListener('click', function() {
            // Add visual feedback on click
            this.classList.add('btn-clicked');
            setTimeout(() => this.classList.remove('btn-clicked'), 200);
            
            // This will be implemented in etiqueta-manager.js
            if (typeof imprimirEtiqueta === 'function') {
                imprimirEtiqueta();
            } else {
                console.error('Função imprimirEtiqueta não encontrada');
            }
        });
    }
}

/**
 * Check if user is authenticated
 */
function checkAuthentication() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        // Redirect to login page if not logged in
        // window.location.href = 'login.html';
        // Commented out for development purposes
    } else {
        // Display user name
        const userDisplayName = document.getElementById('user-display-name');
        if (userDisplayName) {
            const userData = JSON.parse(loggedInUser);
            userDisplayName.textContent = userData.nome || 'Usuário';
        }
    }
}

/**
 * Initialize all databases
 */
function initDatabases() {
    // Check if the necessary functions exist and call them
    if (typeof initEstoqueDatabase === 'function') {
        initEstoqueDatabase();
    }
    
    if (typeof initCategoriasDatabase === 'function') {
        initCategoriasDatabase();
    }
    
    // Initialize other databases as needed
    initEtiquetasDatabase();
    initContagemEstoqueDatabase();
    initProducaoDatabase();
}

/**
 * Initialize etiquetas database
 */
function initEtiquetasDatabase() {
    // Check if etiquetas already exists in localStorage
    if (!localStorage.getItem('etiquetas')) {
        // Initialize with an empty array
        localStorage.setItem('etiquetas', JSON.stringify([]));
    }
}

/**
 * Initialize contagem de estoque database
 */
function initContagemEstoqueDatabase() {
    // Check if contagens already exists in localStorage
    if (!localStorage.getItem('contagens')) {
        // Initialize with an empty array
        localStorage.setItem('contagens', JSON.stringify([]));
    }
}

/**
 * Initialize producao database
 */
function initProducaoDatabase() {
    // Check if producao already exists in localStorage
    if (!localStorage.getItem('producao')) {
        // Initialize with an empty array
        localStorage.setItem('producao', JSON.stringify([]));
    }
}

/**
 * Load responsáveis from database
 */
function loadResponsaveis() {
    // Get funcionarios from localStorage
    const funcionarios = JSON.parse(localStorage.getItem('funcionarios') || '[]');
    const container = document.getElementById('responsavel-grid-container');
    
    if (container) {
        container.innerHTML = '';
        
        if (funcionarios.length === 0) {
            container.innerHTML = '<p class="text-center">Nenhum funcionário cadastrado. Acesse o painel administrativo para cadastrar.</p>';
            return;
        }
        
        funcionarios.forEach(funcionario => {
            const card = document.createElement('div');
            card.className = 'item-card';
            card.dataset.id = funcionario.id;
            
            card.innerHTML = `
                <div class="item-icon"><i class="fas fa-user"></i></div>
                <div class="item-name">${funcionario.nome}</div>
            `;
            
            card.addEventListener('click', function() {
                // Add visual feedback on click
                this.classList.add('card-selected');
                setTimeout(() => {
                    // Remove selection from all cards
                    document.querySelectorAll('.item-card').forEach(c => c.classList.remove('card-selected'));
                    
                    // Store selected responsavel
                    localStorage.setItem('selectedResponsavel', JSON.stringify(funcionario));
                    
                    // Move to next step
                    document.querySelectorAll('.content-section').forEach(section => {
                        section.style.display = 'none';
                    });
                    document.getElementById('selecionar-grupo-section').style.display = 'block';
                    
                    // Load grupos
                    loadGrupos();
                }, 300);
            });
            
            container.appendChild(card);
        });
    }
}

/**
 * Load grupos (categorias) from database
 */
function loadGrupos() {
    // Get categorias from localStorage
    const categorias = JSON.parse(localStorage.getItem('categorias') || '[]');
    const container = document.getElementById('grupo-grid-container');
    
    if (container) {
        container.innerHTML = '';
        
        if (categorias.length === 0) {
            container.innerHTML = '<p class="text-center">Nenhuma categoria cadastrada. Acesse o painel administrativo para cadastrar.</p>';
            return;
        }
        
        categorias.forEach(categoria => {
            const card = document.createElement('div');
            card.className = 'item-card';
            card.dataset.id = categoria.id;
            
            card.innerHTML = `
                <div class="item-icon"><i class="fas fa-folder"></i></div>
                <div class="item-name">${categoria.nome}</div>
            `;
            
            card.addEventListener('click', function() {
                // Add visual feedback on click
                this.classList.add('card-selected');
                setTimeout(() => {
                    // Remove selection from all cards
                    document.querySelectorAll('.item-card').forEach(c => c.classList.remove('card-selected'));
                    
                    // Store selected grupo
                    localStorage.setItem('selectedGrupo', JSON.stringify(categoria));
                    
                    // Move to next step
                    document.querySelectorAll('.content-section').forEach(section => {
                        section.style.display = 'none';
                    });
                    document.getElementById('selecionar-produto-section').style.display = 'block';
                    
                    // Load produtos
                    loadProdutos(categoria.id);
                }, 300);
            });
            
            container.appendChild(card);
        });
    }
}

/**
 * Load produtos from database filtered by categoria
 */
function loadProdutos(categoriaId) {
    // Get produtos from localStorage
    const produtos = JSON.parse(localStorage.getItem('produtos') || '[]');
    const container = document.getElementById('produto-grid-container');
    
    if (container) {
        container.innerHTML = '';
        
        // Filter produtos by categoria
        const produtosFiltrados = produtos.filter(produto => produto.categoriaId === categoriaId);
        
        if (produtosFiltrados.length === 0) {
            container.innerHTML = '<p class="text-center">Nenhum produto cadastrado nesta categoria. Acesse o painel administrativo para cadastrar.</p>';
            return;
        }
        
        produtosFiltrados.forEach(produto => {
            const card = document.createElement('div');
            card.className = 'item-card product-card';
            card.dataset.id = produto.id;
            
            card.innerHTML = `
                <div class="item-icon"><i class="fas fa-box"></i></div>
                <div class="item-name">${produto.nome}</div>
            `;
            
            card.addEventListener('click', function() {
                // Add visual feedback on click
                this.classList.add('card-selected');
                setTimeout(() => {
                    // Remove selection from all cards
                    document.querySelectorAll('.item-card').forEach(c => c.classList.remove('card-selected'));
                    
                    // Store selected produto
                    localStorage.setItem('selectedProduto', JSON.stringify(produto));
                    
                    // Move to next step
                    document.querySelectorAll('.content-section').forEach(section => {
                        section.style.display = 'none';
                    });
                    document.getElementById('imprimir-etiqueta-section').style.display = 'block';
                    
                    // Update etiqueta preview
                    updateEtiquetaPreview(produto);
                }, 300);
            });
            
            container.appendChild(card);
        });
    }
}

/**
 * Update etiqueta preview with product information
 */
function updateEtiquetaPreview(produto) {
    // Get selected responsavel
    const responsavel = JSON.parse(localStorage.getItem('selectedResponsavel') || '{}');
    
    // Update preview elements
    document.getElementById('preview-product-name').textContent = produto.nome || 'NOME PRODUTO';
    document.getElementById('preview-responsavel').textContent = responsavel.nome || '---------';
    
    // Set current date and time for manipulacao
    const now = new Date();
    const manipulacaoDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} - ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    document.getElementById('preview-manipulacao').textContent = manipulacaoDate;
    
    // Calculate validade based on produto.validade (days)
    const validadeDate = new Date(now);
    validadeDate.setDate(validadeDate.getDate() + (produto.validade || 1));
    
    // Format the date in Brazilian format (DD/MM/YYYY) without time for better readability
    const validadeDateStr = `${validadeDate.getDate().toString().padStart(2, '0')}/${(validadeDate.getMonth() + 1).toString().padStart(2, '0')}/${validadeDate.getFullYear()}`;
    document.getElementById('preview-validade').textContent = validadeDateStr;
}