import React, { useState } from 'react';
import './Stock.css'; // Import the new CSS file

// Import tab components (will be created next)
import StockDashboardTab from './StockDashboardTab';
import StockMovementsTab from './StockMovementsTab';
import SuppliersTab from './SuppliersTab';
import PurchasesTab from './PurchasesTab';
import StockProductsTab from './StockProductsTab';

const Stock = () => {
  const [activeTab, setActiveTab] = useState('dashboard'); // Default active tab

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <StockDashboardTab />;
      case 'movements':
        return <StockMovementsTab />;
      case 'suppliers':
        return <SuppliersTab />;
      case 'purchases':
        return <PurchasesTab />;
      case 'products':
        return <StockProductsTab />;
      default:
        return <StockDashboardTab />;
    }
  };

  return (
    <div className="stock-management-container">
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`tab ${activeTab === 'movements' ? 'active' : ''}`}
          onClick={() => setActiveTab('movements')}
        >
          Movimentações
        </button>
        <button
          className={`tab ${activeTab === 'suppliers' ? 'active' : ''}`}
          onClick={() => setActiveTab('suppliers')}
        >
          Fornecedores
        </button>
        <button
          className={`tab ${activeTab === 'purchases' ? 'active' : ''}`}
          onClick={() => setActiveTab('purchases')}
        >
          Compras
        </button>
        <button
          className={`tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Produtos
        </button>
      </div>
      <div className="content-container">{renderContent()}</div>
    </div>
  );
};

export default Stock;
