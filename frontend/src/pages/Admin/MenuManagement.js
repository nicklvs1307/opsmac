import React, { useState } from 'react';
import './MenuManagement.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faCloudUploadAlt, faSave } from '@fortawesome/free-solid-svg-icons';

const MenuManagement = () => {
    const [activeTab, setActiveTab] = useState('categories');

    const renderContent = () => {
        switch (activeTab) {
            case 'categories':
                return <CategoriesTab />;
            case 'products':
                return <ProductsTab />;
            case 'addons':
                return <AddonsTab />;
            case 'variations':
                return <VariationsTab />;
            default:
                return <CategoriesTab />;
        }
    };

    return (
        <div className="menu-management-container">
            <div className="tabs">
                <button className={`tab ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>Categorias</button>
                <button className={`tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>Produtos</button>
                <button className={`tab ${activeTab === 'addons' ? 'active' : ''}`} onClick={() => setActiveTab('addons')}>Adicionais</button>
                <button className={`tab ${activeTab === 'variations' ? 'active' : ''}`} onClick={() => setActiveTab('variations')}>Variações</button>
            </div>
            <div className="content-container">
                {renderContent()}
            </div>
        </div>
    );
};

const CategoriesTab = () => (
    <div className="tab-content active" id="categories">
        <div className="table-container">
            <div className="table-header">
                <span className="table-title">Todas as Categorias</span>
                <button className="btn btn-primary">
                    <FontAwesomeIcon icon={faPlus} /> Nova Categoria
                </button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Descrição</th>
                        <th>Produtos</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Pizzas</td>
                        <td>Pizzas tradicionais e especiais</td>
                        <td>25</td>
                        <td><span className="status active">Ativo</span></td>
                        <td>
                            <button className="action-btn edit-btn"><FontAwesomeIcon icon={faEdit} /></button>
                            <button className="action-btn delete-btn"><FontAwesomeIcon icon={faTrash} /></button>
                        </td>
                    </tr>
                    {/* ... other example rows ... */}
                </tbody>
            </table>
        </div>
    </div>
);

const ProductsTab = () => (
    <div className="tab-content active" id="products">
         <div className="table-container">
            <div className="table-header">
                <span className="table-title">Todos os Produtos</span>
                <div>
                    <select className="form-control" style={{width: 'auto', display: 'inline-block', marginRight: '10px'}}>
                        <option>Todas Categorias</option>
                        <option>Pizzas</option>
                    </select>
                    <button className="btn btn-primary">
                        <FontAwesomeIcon icon={faPlus} /> Novo Produto
                    </button>
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th style={{width: '50px'}}>#</th>
                        <th>Produto</th>
                        <th>Categoria</th>
                        <th>Preço</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1</td>
                        <td>Hambúrguer Clássico</td>
                        <td>Hambúrgueres</td>
                        <td>R$ 24,90</td>
                        <td><span className="status active">Ativo</span></td>
                        <td>
                            <button className="action-btn edit-btn"><FontAwesomeIcon icon={faEdit} /></button>
                            <button className="action-btn delete-btn"><FontAwesomeIcon icon={faTrash} /></button>
                        </td>
                    </tr>
                     {/* ... other example rows ... */}
                </tbody>
            </table>
        </div>
    </div>
);

const AddonsTab = () => (
    <div className="tab-content active" id="addons">
        <div className="table-container">
            <div className="table-header">
                <span className="table-title">Todos os Adicionais</span>
                <button className="btn btn-primary">
                    <FontAwesomeIcon icon={faPlus} /> Novo Adicional
                </button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Preço (R$)</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Borda de Catupiry</td>
                        <td>8.00</td>
                        <td><span className="status active">Ativo</span></td>
                        <td>
                            <button className="action-btn edit-btn"><FontAwesomeIcon icon={faEdit} /></button>
                            <button className="action-btn delete-btn"><FontAwesomeIcon icon={faTrash} /></button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
);

const VariationsTab = () => (
    <div className="tab-content active" id="variations">
        <div className="table-container">
            <div className="table-header">
                <span className="table-title">Todas as Variações</span>
                <button className="btn btn-primary">
                    <FontAwesomeIcon icon={faPlus} /> Nova Variação
                </button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Nome (Ex: Tamanho)</th>
                        <th>Opções (Ex: Pequena, Média, Grande)</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Tamanho</td>
                        <td>Pequena, Média, Grande</td>
                        <td><span className="status active">Ativo</span></td>
                        <td>
                            <button className="action-btn edit-btn"><FontAwesomeIcon icon={faEdit} /></button>
                            <button className="action-btn delete-btn"><FontAwesomeIcon icon={faTrash} /></button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
);


export default MenuManagement;
