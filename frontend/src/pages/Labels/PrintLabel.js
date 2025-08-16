import React, { useState, useEffect } from 'react';
import apiClient from '../api/axiosInstance';
import './PrintLabel.css';

// Placeholder components for each step
const SelectResponsible = ({ onSelect }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await apiClient.get('/labels/users');
                setUsers(res.data);
            } catch (err) {
                setError('Failed to load users.');
                console.error(err);
            }
            setLoading(false);
        };
        fetchUsers();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h2>Selecionar responsável</h2>
            <div className="item-grid">
                {users.map(user => (
                    <div key={user.id} className="item-card" onClick={() => onSelect(user)}>
                        <span className="name">{user.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SelectItem = ({ onSelect }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await apiClient.get('/labels/items');
                setItems(res.data);
            } catch (err) {
                setError('Failed to load items.');
                console.error(err);
            }
            setLoading(false);
        };
        fetchItems();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h2>Selecionar produto</h2>
            <div className="item-grid product-grid">
                {items.map(item => (
                    <div key={`${item.type}-${item.id}`} className="item-card" onClick={() => onSelect(item)}>
                        <span className="name">{item.name}</span>
                        <span className="category">{item.type}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const LabelPreview = ({ item, responsible, onPrint, onBack }) => {
    const [formData, setFormData] = useState({ quantity: 1, lot: '' });

    const handlePrint = async () => {
        const expirationDate = new Date();
        if (item.default_expiration_days) {
            expirationDate.setDate(expirationDate.getDate() + item.default_expiration_days);
        }

        const payload = {
            labelable_id: item.id,
            labelable_type: item.type,
            expiration_date: expirationDate.toISOString(),
            quantity_printed: formData.quantity,
            lot_number: formData.lot,
        };
        
        try {
            await apiClient.post('/labels/print', payload);
            alert('Label printed successfully!'); // Replace with a proper notification
            onPrint(payload);
        } catch (err) {
            alert('Failed to print label.'); // Replace with a proper notification
            console.error(err);
        }
    };

    return (
        <div>
            <h2>Pré-visualização da Etiqueta</h2>
            <p>Responsável: {responsible?.name}</p>
            <p>Item: {item?.name}</p>
            <div>
                <label>Quantidade:</label>
                <input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value, 10) || 1})} />
            </div>
            <div>
                <label>Lote:</label>
                <input type="text" value={formData.lot} onChange={e => setFormData({...formData, lot: e.target.value})} />
            </div>
            <button onClick={onBack} className="btn btn-secondary">Voltar</button>
            <button onClick={handlePrint} className="btn btn-primary">Imprimir</button>
        </div>
    );
};


const PrintLabel = () => {
    const [step, setStep] = useState(1);
    const [responsible, setResponsible] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);

    const handleSelectResponsible = (user) => {
        setResponsible(user);
        setStep(2);
    };

    const handleSelectItem = (item) => {
        setSelectedItem(item);
        setStep(3);
    };

    const handlePrint = () => {
        // Reset the flow after printing
        setStep(1);
        setResponsible(null);
        setSelectedItem(null);
    };

    const goBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return <SelectResponsible onSelect={handleSelectResponsible} />;
            case 2:
                return <SelectItem onSelect={handleSelectItem} />;
            case 3:
                return <LabelPreview item={selectedItem} responsible={responsible} onPrint={handlePrint} onBack={() => setStep(2)} />;
            default:
                return <div>Unknown Step</div>;
        }
    };

    return (
        <div className="print-label-container">
            <div className="wizard-steps">
                <span className={step >= 1 ? 'active' : ''}>1. Responsável</span>
                <span className={step >= 2 ? 'active' : ''}>2. Produto</span>
                <span className={step >= 3 ? 'active' : ''}>3. Imprimir</span>
            </div>
            <div className="wizard-content">
                {step > 1 && <button onClick={goBack} className="btn btn-secondary mb-3">Voltar</button>}
                {renderStep()}
            </div>
        </div>
    );
};

export default PrintLabel;
