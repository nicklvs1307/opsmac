import React from 'react';
import { useQuery } from 'react-query';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../contexts/AuthContext';

const fetchDashboardData = async (restaurantId) => {
  // This endpoint needs to be created in the backend
  const { data } = await axiosInstance.get(`/api/stock/dashboard?restaurant_id=${restaurantId}`);
  return data;
};

const StockDashboardTab = () => {
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;

  const { data: dashboardData, isLoading, isError } = useQuery(
    ['stockDashboard', restaurantId],
    () => fetchDashboardData(restaurantId),
    { enabled: !!restaurantId }
  );

  if (isLoading) return <div>Carregando Dashboard...</div>;
  if (isError) return <div>Erro ao carregar Dashboard.</div>;

  const { totalProducts, inStock, lowStock, outOfStock, lowStockProducts } = dashboardData || {};

  return (
    <div className="stock-dashboard-tab">
      <div className="header">
        <h1 className="page-title">Dashboard de Estoque</h1>
      </div>

      {/* Alerts */}
      {(lowStock > 0 || outOfStock > 0) && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          <div>
            <strong>Atenção!</strong> {lowStock} produtos estão com estoque baixo e {outOfStock} produtos estão em falta.
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="dashboard-cards">
        <div className="card stat-card">
          <div className="stat-icon icon-primary">
            <i className="fas fa-boxes"></i>
          </div>
          <div className="stat-info">
            <h4>{totalProducts}</h4>
            <p>Total de Produtos</p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon icon-success">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-info">
            <h4>{inStock}</h4>
            <p>Em Estoque</p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon icon-warning">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="stat-info">
            <h4>{lowStock}</h4>
            <p>Estoque Baixo</p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon icon-danger">
            <i className="fas fa-times-circle"></i>
          </div>
          <div className="stat-info">
            <h4>{outOfStock}</h4>
            <p>Em Falta</p>
          </div>
        </div>
      </div>

      {/* Table of Products with Low Stock */}
      <div className="table-container">
        <h2 style={{ marginBottom: '20px' }}>Produtos com Estoque Baixo</h2>
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Categoria</th>
              <th>Estoque Atual</th>
              <th>Estoque Mínimo</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lowStockProducts && lowStockProducts.length > 0 ? (
              lowStockProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.category_name || 'N/A'}</td> {/* Assuming category_name is available */}
                  <td>{product.current_stock}</td>
                  <td>{product.min_stock}</td>
                  <td><span className={`status ${product.current_stock <= 0 ? 'status-out' : 'status-low'}`}>{product.current_stock <= 0 ? 'Em Falta' : 'Estoque Baixo'}</span></td>
                  <td>
                    <button className="action-btn btn-edit"><i className="fas fa-edit"></i></button>
                    <button className="action-btn btn-delete"><i className="fas fa-trash"></i></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">Nenhum produto com estoque baixo.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockDashboardTab;