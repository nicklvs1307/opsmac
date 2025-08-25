import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faCloudUploadAlt,
  faSave,
} from '@fortawesome/free-solid-svg-icons';

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
    <div className="p-5 bg-gray-100 min-h-screen">
      <div className="flex border-b border-gray-200 mb-5">
        <button
          className={`px-5 py-2 cursor-pointer border-b-2 border-transparent font-medium text-gray-500 transition-all duration-300 bg-transparent border-none text-base ${activeTab === 'categories' ? 'text-blue-500 border-blue-500' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Categorias
        </button>
        <button
          className={`px-5 py-2 cursor-pointer border-b-2 border-transparent font-medium text-gray-500 transition-all duration-300 bg-transparent border-none text-base ${activeTab === 'products' ? 'text-blue-500 border-blue-500' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Produtos
        </button>
        <button
          className={`px-5 py-2 cursor-pointer border-b-2 border-transparent font-medium text-gray-500 transition-all duration-300 bg-transparent border-none text-base ${activeTab === 'addons' ? 'text-blue-500 border-blue-500' : ''}`}
          onClick={() => setActiveTab('addons')}
        >
          Adicionais
        </button>
        <button
          className={`px-5 py-2 cursor-pointer border-b-2 border-transparent font-medium text-gray-500 transition-all duration-300 bg-transparent border-none text-base ${activeTab === 'variations' ? 'text-blue-500 border-blue-500' : ''}`}
          onClick={() => setActiveTab('variations')}
        >
          Variações
        </button>
      </div>
      <div className="content-container">{renderContent()}</div>
    </div>
  );
};

const CategoriesTab = () => (
  <div className="block" id="categories">
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <span className="text-lg font-semibold">Todas as Categorias</span>
        <button className="px-4 py-2 border-none rounded-md cursor-pointer font-medium transition-all duration-300 inline-flex items-center justify-center bg-blue-500 text-white hover:bg-blue-600">
          <FontAwesomeIcon icon={faPlus} className="mr-2" /> Nova Categoria
        </button>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left border-b border-gray-200">Nome</th>
            <th className="p-3 text-left border-b border-gray-200">Descrição</th>
            <th className="p-3 text-left border-b border-gray-200">Produtos</th>
            <th className="p-3 text-left border-b border-gray-200">Status</th>
            <th className="p-3 text-left border-b border-gray-200">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr className="hover:bg-gray-50">
            <td className="p-3 text-left border-b border-gray-200">Pizzas</td>
            <td className="p-3 text-left border-b border-gray-200">
              Pizzas tradicionais e especiais
            </td>
            <td className="p-3 text-left border-b border-gray-200">25</td>
            <td className="p-3 text-left border-b border-gray-200">
              <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                Ativo
              </span>
            </td>
            <td className="p-3 text-left border-b border-gray-200">
              <button className="p-1 px-2 border-none rounded-md cursor-pointer mr-1 text-sm transition-all duration-300 bg-transparent text-blue-500 hover:bg-blue-100">
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button className="p-1 px-2 border-none rounded-md cursor-pointer mr-1 text-sm transition-all duration-300 bg-transparent text-red-500 hover:bg-red-100">
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </td>
          </tr>
          {/* ... other example rows ... */}
        </tbody>
      </table>
    </div>
  </div>
);

const ProductsTab = () => (
  <div className="block" id="products">
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <span className="text-lg font-semibold">Todos os Produtos</span>
        <div>
          <select
            className="w-full p-3 border border-gray-300 rounded-md text-sm transition-all duration-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            style={{ width: 'auto', display: 'inline-block', marginRight: '10px' }}
          >
            <option>Todas Categorias</option>
            <option>Pizzas</option>
          </select>
          <button className="px-4 py-2 border-none rounded-md cursor-pointer font-medium transition-all duration-300 inline-flex items-center justify-center bg-blue-500 text-white hover:bg-blue-600">
            <FontAwesomeIcon icon={faPlus} className="mr-2" /> Novo Produto
          </button>
        </div>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left border-b border-gray-200" style={{ width: '50px' }}>
              #
            </th>
            <th className="p-3 text-left border-b border-gray-200">Produto</th>
            <th className="p-3 text-left border-b border-gray-200">Categoria</th>
            <th className="p-3 text-left border-b border-gray-200">Preço</th>
            <th className="p-3 text-left border-b border-gray-200">Status</th>
            <th className="p-3 text-left border-b border-gray-200">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr className="hover:bg-gray-50">
            <td className="p-3 text-left border-b border-gray-200">1</td>
            <td className="p-3 text-left border-b border-gray-200">Hambúrguer Clássico</td>
            <td className="p-3 text-left border-b border-gray-200">Hambúrgueres</td>
            <td className="p-3 text-left border-b border-gray-200">R$ 24,90</td>
            <td className="p-3 text-left border-b border-gray-200">
              <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                Ativo
              </span>
            </td>
            <td className="p-3 text-left border-b border-gray-200">
              <button className="p-1 px-2 border-none rounded-md cursor-pointer mr-1 text-sm transition-all duration-300 bg-transparent text-blue-500 hover:bg-blue-100">
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button className="p-1 px-2 border-none rounded-md cursor-pointer mr-1 text-sm transition-all duration-300 bg-transparent text-red-500 hover:bg-red-100">
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </td>
          </tr>
          {/* ... other example rows ... */}
        </tbody>
      </table>
    </div>
  </div>
);

const AddonsTab = () => (
  <div className="block" id="addons">
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <span className="text-lg font-semibold">Todos os Adicionais</span>
        <button className="px-4 py-2 border-none rounded-md cursor-pointer font-medium transition-all duration-300 inline-flex items-center justify-center bg-blue-500 text-white hover:bg-blue-600">
          <FontAwesomeIcon icon={faPlus} className="mr-2" /> Novo Adicional
        </button>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left border-b border-gray-200">Nome</th>
            <th className="p-3 text-left border-b border-gray-200">Preço (R$)</th>
            <th className="p-3 text-left border-b border-gray-200">Status</th>
            <th className="p-3 text-left border-b border-gray-200">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr className="hover:bg-gray-50">
            <td className="p-3 text-left border-b border-gray-200">Borda de Catupiry</td>
            <td className="p-3 text-left border-b border-gray-200">8.00</td>
            <td className="p-3 text-left border-b border-gray-200">
              <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                Ativo
              </span>
            </td>
            <td className="p-3 text-left border-b border-gray-200">
              <button className="p-1 px-2 border-none rounded-md cursor-pointer mr-1 text-sm transition-all duration-300 bg-transparent text-blue-500 hover:bg-blue-100">
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button className="p-1 px-2 border-none rounded-md cursor-pointer mr-1 text-sm transition-all duration-300 bg-transparent text-red-500 hover:bg-red-100">
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

const VariationsTab = () => (
  <div className="block" id="variations">
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <span className="text-lg font-semibold">Todas as Variações</span>
        <button className="px-4 py-2 border-none rounded-md cursor-pointer font-medium transition-all duration-300 inline-flex items-center justify-center bg-blue-500 text-white hover:bg-blue-600">
          <FontAwesomeIcon icon={faPlus} className="mr-2" /> Nova Variação
        </button>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left border-b border-gray-200">Nome (Ex: Tamanho)</th>
            <th className="p-3 text-left border-b border-gray-200">
              Opções (Ex: Pequena, Média, Grande)
            </th>
            <th className="p-3 text-left border-b border-gray-200">Status</th>
            <th className="p-3 text-left border-b border-gray-200">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr className="hover:bg-gray-50">
            <td className="p-3 text-left border-b border-gray-200">Tamanho</td>
            <td className="p-3 text-left border-b border-gray-200">Pequena, Média, Grande</td>
            <td className="p-3 text-left border-b border-gray-200">
              <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                Ativo
              </span>
            </td>
            <td className="p-3 text-left border-b border-gray-200">
              <button className="p-1 px-2 border-none rounded-md cursor-pointer mr-1 text-sm transition-all duration-300 bg-transparent text-blue-500 hover:bg-blue-100">
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button className="p-1 px-2 border-none rounded-md cursor-pointer mr-1 text-sm transition-all duration-300 bg-transparent text-red-500 hover:bg-red-100">
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

export default MenuManagement;
