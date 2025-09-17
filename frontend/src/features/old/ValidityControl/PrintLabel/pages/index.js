import React, { useState } from 'react';
import styles from '../style.module.css';
import {
  useLabelUsers,
  useLabelItems,
  usePrintLabel,
} from '@/features/ValidityControl/PrintLabel/api/printLabelService';
import { CircularProgress, Alert } from '@mui/material';

const PrintLabel = () => {
  const [step, setStep] = useState(1);
  const [responsible, setResponsible] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({ quantity: 1, lot: '' });

  const {
    data: users,
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
    error: usersError,
  } = useLabelUsers({
    onError: (error) => {
      console.error('Error fetching users:', error);
    },
  });

  const {
    data: items,
    isLoading: isLoadingItems,
    isError: isErrorItems,
    error: itemsError,
  } = useLabelItems({
    onError: (error) => {
      console.error('Error fetching items:', error);
    },
  });

  const printLabelMutation = usePrintLabel({
    onSuccess: () => {
      setStep(1);
      setResponsible(null);
      setSelectedItem(null);
      // Invalidate queries if needed, e.g., to refresh a list of printed labels
      // queryClient.invalidateQueries('printedLabels');
    },
  });

  const handlePrint = () => {
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

    printLabelMutation.mutate(payload);
  };

  const renderStepContent = () => {
    if (isLoadingUsers || isLoadingItems) {
      return (
        <div className={styles['content-section']}>
          <CircularProgress />
          <p>Carregando dados...</p>
        </div>
      );
    }

    if (isErrorUsers || isErrorItems) {
      return (
        <div className={styles['content-section']}>
          <Alert severity="error">
            {usersError?.message || itemsError?.message || 'Erro ao carregar dados.'}
          </Alert>
        </div>
      );
    }

    switch (step) {
      case 1:
        return (
          <section id="selecionar-responsavel-section" className={styles['content-section']}>
            <div className={styles['section-header']}>
              <h2>Selecionar responsável</h2>
              <p>Selecione o nome do responsável por essa impressão.</p>
            </div>
            <div className={styles['item-grid']}>
              {users?.map((user) => (
                <div
                  key={user.id}
                  className={styles['item-card']}
                  onClick={() => {
                    setResponsible(user);
                    setStep(2);
                  }}
                >
                  <span className={styles['item-name']}>{user.name}</span>
                </div>
              ))}
            </div>
          </section>
        );
      case 2:
        return (
          <section id="selecionar-produto-section" className={styles['content-section']}>
            <div className={styles['section-header']}>
              <h2>Selecionar produto</h2>
              <p>Selecione o produto que deseja imprimir.</p>
            </div>
            <div className={`${styles['item-grid']} ${styles['product-grid']}`}>
              {items?.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className={styles['item-card']}
                  onClick={() => {
                    setSelectedItem(item);
                    setStep(3);
                  }}
                >
                  <span className={styles['item-name']}>{item.name}</span>
                </div>
              ))}
            </div>
            <div className={styles['pagination-controls']}>
              <button
                onClick={() => setStep(1)}
                className={`${styles.btn} ${styles['btn-secondary']}`}
              >
                Voltar
              </button>
            </div>
          </section>
        );
      case 3:
        return (
          <section id="imprimir-etiqueta-section" className={styles['content-section']}>
            <div className={styles['imprimir-header']}>
              <button
                onClick={() => setStep(2)}
                className={`${styles.btn} ${styles['btn-secondary']}`}
              >
                Voltar
              </button>
            </div>
            <p>
              Sua etiqueta está pronta para ser impressa, mas se preferir você pode inserir
              informações adicionais.
            </p>
            <div className={`${styles['imprimir-container']} ${styles.card}`}>
              <div className={styles['etiqueta-preview-container']}>
                <h4>Pré-visualização</h4>
                <div className={styles['etiqueta-preview']}>
                  <p className={styles['preview-product-name']}>
                    <strong>{selectedItem?.name}</strong>
                  </p>
                  <p>RESP.: {responsible?.name}</p>
                </div>
              </div>
              <div className={styles['etiqueta-form-container']}>
                <h4>Informações adicionais</h4>
                <div className={styles['form-grid']}>
                  <div className={styles['form-group']}>
                    <label htmlFor="lote">Lote</label>
                    <input
                      type="text"
                      id="lote"
                      value={formData.lot}
                      onChange={(e) => setFormData({ ...formData, lot: e.target.value })}
                      className={styles['form-control']}
                    />
                  </div>
                </div>
                <div className={styles['form-actions']}>
                  <div className={styles['quantity-control']}>
                    <label>Quantidade:</label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 1 })
                      }
                      className={`${styles['form-control']} ${styles['quantity-input']}`}
                    />
                  </div>
                  <button
                    onClick={handlePrint}
                    className={`${styles.btn} ${styles['btn-danger']}`}
                    disabled={printLabelMutation.isLoading}
                  >
                    {printLabelMutation.isLoading ? 'Imprimindo...' : 'Imprimir'}
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

  return <div className={styles['print-label-content']}>{renderStepContent()}</div>;
};

export default PrintLabel;
