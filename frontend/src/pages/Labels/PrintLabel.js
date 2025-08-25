import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/axiosInstance';
import './PrintLabel.css';

const PrintLabel = () => {
  const [step, setStep] = useState(1);
  const [responsible, setResponsible] = useState(null);
  const [group, setGroup] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({ quantity: 1, lot: '' });

  useEffect(() => {
    apiClient
      .get('/labels/users')
      .then((res) => setUsers(res.data))
      .catch(console.error);
    apiClient
      .get('/labels/items')
      .then((res) => setItems(res.data))
      .catch(console.error);
  }, []);

  const handlePrint = async () => {
    const expirationDate = new Date();
    if (selectedItem.default_expiration_days) {
      expirationDate.setDate(expirationDate.getDate() + selectedItem.default_expiration_days);
    }

    const payload = {
      labelable_id: selectedItem.id,
      labelable_type: selectedItem.type,
      expiration_date: expirationDate.toISOString(),
      quantity_printed: formData.quantity,
      lot_number: formData.lot,
    };

    try {
      await apiClient.post('/labels/print', payload);
      alert('Label printed successfully!');
      setStep(1);
      setResponsible(null);
      setGroup(null);
      setSelectedItem(null);
    } catch (err) {
      alert('Failed to print label.');
      console.error(err);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <section id="selecionar-responsavel-section" className="content-section">
            <div className="section-header">
              <h2>Selecionar responsável</h2>
              <p>Selecione o nome do responsável por essa impressão.</p>
            </div>
            <div className="item-grid">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="item-card"
                  onClick={() => {
                    setResponsible(user);
                    setStep(2);
                  }}
                >
                  <span className="item-name">{user.name}</span>
                </div>
              ))}
            </div>
          </section>
        );
      case 2:
        const groups = [
          { id: 1, name: 'Preparo' },
          { id: 2, name: 'Sobremesas' },
        ];
        return (
          <section id="selecionar-grupo-section" className="content-section">
            <div className="section-header">
              <h2>Selecionar grupo</h2>
              <p>Selecione o grupo do produto que deseja imprimir.</p>
            </div>
            <div className="item-grid">
              {groups.map((g) => (
                <div
                  key={g.id}
                  className="item-card"
                  onClick={() => {
                    setGroup(g);
                    setStep(3);
                  }}
                >
                  <span className="item-name">{g.name}</span>
                </div>
              ))}
            </div>
            <div className="pagination-controls">
              <button onClick={() => setStep(1)} className="btn btn-secondary">
                Voltar
              </button>
            </div>
          </section>
        );
      case 3:
        return (
          <section id="selecionar-produto-section" className="content-section">
            <div className="section-header">
              <h2>Selecionar produto</h2>
              <p>Selecione o produto que deseja imprimir.</p>
            </div>
            <div className="item-grid product-grid">
              {items.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="item-card"
                  onClick={() => {
                    setSelectedItem(item);
                    setStep(4);
                  }}
                >
                  <span className="item-name">{item.name}</span>
                </div>
              ))}
            </div>
            <div className="pagination-controls">
              <button onClick={() => setStep(2)} className="btn btn-secondary">
                Voltar
              </button>
            </div>
          </section>
        );
      case 4:
        return (
          <section id="imprimir-etiqueta-section" className="content-section">
            <div className="imprimir-header">
              <button onClick={() => setStep(3)} className="btn btn-secondary">
                Voltar
              </button>
            </div>
            <p>
              Sua etiqueta está pronta para ser impressa, mas se preferir você pode inserir
              informações adicionais.
            </p>
            <div className="imprimir-container card">
              <div className="etiqueta-preview-container">
                <h4>Pré-visualização</h4>
                <div className="etiqueta-preview">
                  <p className="preview-product-name">
                    <strong>{selectedItem?.name}</strong>
                  </p>
                  <p>RESP.: {responsible?.name}</p>
                </div>
              </div>
              <div className="etiqueta-form-container">
                <h4>Informações adicionais</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="lote">Lote</label>
                    <input
                      type="text"
                      id="lote"
                      value={formData.lot}
                      onChange={(e) => setFormData({ ...formData, lot: e.target.value })}
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <div className="quantity-control">
                    <label>Quantidade:</label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 1 })
                      }
                      className="form-control quantity-input"
                    />
                  </div>
                  <button onClick={handlePrint} className="btn btn-danger">
                    Imprimir
                  </button>
                </div>
              </div>
            </div>
          </section>
        );
      default:
        return <div>Unknown Step</div>;
    }
  };

  return <div className="print-label-content">{renderStepContent()}</div>;
};

export default PrintLabel;
