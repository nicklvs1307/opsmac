import React, { useState, useEffect } from 'react';
import './Menu.css';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const Icon = ({ name }) => <i className={`fas fa-${name}`}></i>;

// --- API Functions ---
const api = {
    fetch: (key, id) => axiosInstance.get(`/${key}?restaurant_id=${id}`).then(res => res.data),
    create: (key, data) => axiosInstance.post(`/${key}`, data).then(res => res.data),
    update: (key, { id, ...data }) => axiosInstance.put(`/${key}/${id}`, data).then(res => res.data),
    delete: (key, id) => axiosInstance.delete(`/${key}/${id}`).then(res => res.data),
};

const Menu = () => {
    const [activeTab, setActiveTab] = useState('categories');

    const renderContent = () => {
        switch (activeTab) {
            case 'categories': return <CategoriesTab />;
            case 'products': return <ProductsTab />;
            case 'addons': return <AddonsTab />;
            default: return <CategoriesTab />;
        }
    };

    return (
        <div className="menu-management-container">
            <div className="tabs">
                <button className={`tab ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>Categorias</button>
                <button className={`tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>Produtos</button>
                <button className={`tab ${activeTab === 'addons' ? 'active' : ''}`} onClick={() => setActiveTab('addons')}>Adicionais</button>
            </div>
            <div className="content-container">{renderContent()}</div>
        </div>
    );
};

// --- Categories Tab ---
const CategoriesTab = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const { data: categories, isLoading, isError } = useQuery(
        ['categories', user?.restaurants[0]?.id],
        () => api.fetch('api/categories', user?.restaurants[0]?.id),
        { enabled: !!user?.restaurants[0]?.id }
    );

    const mutationOptions = (action, resource) => ({
        onSuccess: () => {
            toast.success(`${resource} ${action} com sucesso!`);
            queryClient.invalidateQueries(resource.toLowerCase() + 's');
            closeModal();
        },
        onError: () => toast.error(`Erro ao ${action.toLowerCase()} ${resource.toLowerCase()}.`),
    });

    const createMutation = useMutation((data) => api.create('api/categories', data), mutationOptions('criada', 'Categoria'));
    const updateMutation = useMutation((data) => api.update('api/categories', data), mutationOptions('atualizada', 'Categoria'));
    const deleteMutation = useMutation((id) => api.delete('api/categories', id), mutationOptions('excluída', 'Categoria'));

    const handleSave = (formData) => {
        const dataToSave = { ...formData, restaurant_id: user?.restaurants[0]?.id };
        if (editingCategory) {
            updateMutation.mutate({ id: editingCategory.id, ...dataToSave });
        } else {
            createMutation.mutate(dataToSave);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Tem certeza?')) deleteMutation.mutate(id);
    };

    const openModal = (category = null) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingCategory(null);
        setIsModalOpen(false);
    };

    return (
        <div className="tab-content active">
            <div className="table-container">
                <div className="table-header">
                    <span className="table-title">Todas as Categorias</span>
                    <button className="btn btn-primary" onClick={() => openModal()}><Icon name="plus" /> Nova Categoria</button>
                </div>
                <table>
                    <thead><tr><th>Nome</th><th>Descrição</th><th>Status</th><th>Ações</th></tr></thead>
                    <tbody>
                        {isLoading && <tr><td colSpan="4">Carregando...</td></tr>}
                        {isError && <tr><td colSpan="4">Erro ao carregar dados.</td></tr>}
                        {categories?.map(category => (
                            <tr key={category.id}>
                                <td>{category.name}</td>
                                <td>{category.description}</td>
                                <td><span className={`status ${category.is_active ? 'active' : 'inactive'}`}>{category.is_active ? 'Ativo' : 'Inativo'}</span></td>
                                <td>
                                    <button className="action-btn edit-btn" onClick={() => openModal(category)}><Icon name="edit" /></button>
                                    <button className="action-btn delete-btn" onClick={() => handleDelete(category.id)}><Icon name="trash" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <CategoryModal closeModal={closeModal} onSave={handleSave} category={editingCategory} />}
        </div>
    );
};

const CategoryModal = ({ closeModal, onSave, category }) => {
    const [formData, setFormData] = useState({ name: '', description: '', is_active: true });

    useEffect(() => {
        if (category) setFormData({ name: category.name, description: category.description, is_active: category.is_active });
    }, [category]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal title={category ? 'Editar Categoria' : 'Nova Categoria'} closeModal={closeModal}>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Nome*</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" required />
                </div>
                <div className="form-group">
                    <label>Descrição</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} className="form-control" rows="3"></textarea>
                </div>
                <div className="form-group">
                    <label><input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} /> Categoria Ativa</label>
                </div>
                <div style={styles.modalFooter}>
                    <button type="button" className='btn btn-secondary' onClick={closeModal}>Cancelar</button>
                    <button type="submit" className='btn btn-primary'>Salvar</button>
                </div>
            </form>
        </Modal>
    );
};

// --- Products Tab ---
const ProductsTab = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const restaurantId = user?.restaurants[0]?.id;

    const { data: products, isLoading, isError } = useQuery(
        ['products', restaurantId],
        () => api.fetch('api/products', restaurantId),
        { enabled: !!restaurantId }
    );

    const { data: categories } = useQuery(
        ['categories', restaurantId],
        () => api.fetch('api/categories', restaurantId),
        { enabled: !!restaurantId }
    );

    const mutationOptions = (action) => ({
        onSuccess: () => {
            toast.success(`Produto ${action} com sucesso!`);
            queryClient.invalidateQueries('products');
            closeModal();
        },
        onError: () => toast.error(`Erro ao ${action.toLowerCase()} produto.`),
    });

    const createMutation = useMutation((data) => api.create('api/products', data), mutationOptions('criado'));
    const updateMutation = useMutation((data) => api.update('api/products', data), mutationOptions('atualizado'));
    const deleteMutation = useMutation((id) => api.delete('api/products', id), mutationOptions('excluído'));

    const handleSave = (formData) => {
        const dataToSave = { ...formData, price: parseFloat(formData.price), restaurant_id: restaurantId };
        if (editingProduct) {
            updateMutation.mutate({ id: editingProduct.id, ...dataToSave });
        } else {
            createMutation.mutate(dataToSave);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Tem certeza?')) deleteMutation.mutate(id);
    };

    const openModal = (product = null) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingProduct(null);
        setIsModalOpen(false);
    };

    return (
        <div className="tab-content active">
            <div className="table-container">
                <div className="table-header">
                    <span className="table-title">Todos os Produtos</span>
                    <button className="btn btn-primary" onClick={() => openModal()}><Icon name="plus" /> Novo Produto</button>
                </div>
                <table>
                    <thead><tr><th>Produto</th><th>Categoria</th><th>Preço</th><th>Status</th><th>Ações</th></tr></thead>
                    <tbody>
                        {isLoading && <tr><td colSpan="5">Carregando...</td></tr>}
                        {isError && <tr><td colSpan="5">Erro ao carregar dados.</td></tr>}
                        {products?.map(product => (
                            <tr key={product.id}>
                                <td>{product.name}</td>
                                <td>{categories?.find(c => c.id === product.category_id)?.name || 'N/A'}</td>
                                <td>R$ {Number(product.price).toFixed(2)}</td>
                                <td><span className={`status ${product.is_active ? 'active' : 'inactive'}`}>{product.is_active ? 'Ativo' : 'Inativo'}</span></td>
                                <td>
                                    <button className="action-btn edit-btn" onClick={() => openModal(product)}><Icon name="edit" /></button>
                                    <button className="action-btn delete-btn" onClick={() => handleDelete(product.id)}><Icon name="trash" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <ProductModal closeModal={closeModal} onSave={handleSave} product={editingProduct} categories={categories || []} />}
        </div>
    );
};

const ProductModal = ({ closeModal, onSave, product, categories }) => {
    const [formData, setFormData] = useState({ name: '', description: '', price: '', category_id: '', is_active: true, variations: [] });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price,
                category_id: product.category_id,
                is_active: product.is_active,
                variations: product.variations || [] // Ensure variations is an array
            });
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleVariationChange = (index, field, value) => {
        const newVariations = [...formData.variations];
        newVariations[index][field] = value;
        setFormData(prev => ({ ...prev, variations: newVariations }));
    };

    const addVariation = () => {
        setFormData(prev => ({ ...prev, variations: [...prev.variations, { name: '', price: '' }] }));
    };

    const removeVariation = (index) => {
        const newVariations = formData.variations.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, variations: newVariations }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal title={product ? 'Editar Produto' : 'Novo Produto'} closeModal={closeModal}>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Nome*</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" required />
                </div>
                 <div className="form-group">
                    <label>Categoria*</label>
                    <select name="category_id" value={formData.category_id} onChange={handleChange} className="form-control" required>
                        <option value="">Selecione...</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>Descrição</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} className="form-control" rows="3"></textarea>
                </div>
                <div className="form-group">
                    <label>Preço* (R$)</label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} className="form-control" required step="0.01" />
                </div>
                <div className="form-group">
                    <label><input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} /> Produto Ativo</label>
                </div>

                <div className="form-group">
                    <label>Variações</label>
                    <div className="variants-container">
                        {formData.variations.map((variation, index) => (
                            <div key={index} className="variant-item">
                                <input type="text" value={variation.name} onChange={(e) => handleVariationChange(index, 'name', e.target.value)} className="form-control" placeholder="Nome da Variação (Ex: Grande)" />
                                <input type="number" value={variation.price} onChange={(e) => handleVariationChange(index, 'price', e.target.value)} className="form-control" placeholder="Preço Adicional" step="0.01" />
                                <button type="button" onClick={() => removeVariation(index)} className="btn btn-secondary"><Icon name="trash" /></button>
                            </div>
                        ))}
                        <button type="button" onClick={addVariation} className="btn btn-secondary" style={{ marginTop: '10px' }}>
                            <Icon name="plus" /> Adicionar Variação
                        </button>
                    </div>
                </div>

                <div style={styles.modalFooter}>
                    <button type="button" className='btn btn-secondary' onClick={closeModal}>Cancelar</button>
                    <button type="submit" className='btn btn-primary'>Salvar</button>
                </div>
            </form>
        </Modal>
    );
};


// --- Addons Tab ---
const AddonsTab = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddon, setEditingAddon] = useState(null);

    const restaurantId = user?.restaurants[0]?.id;

    const { data: addons, isLoading, isError } = useQuery(
        ['addons', restaurantId],
        () => api.fetch('api/addons', restaurantId),
        { enabled: !!restaurantId }
    );

    const mutationOptions = (action) => ({
        onSuccess: () => {
            toast.success(`Adicional ${action} com sucesso!`);
            queryClient.invalidateQueries('addons');
            closeModal();
        },
        onError: () => toast.error(`Erro ao ${action.toLowerCase()} adicional.`),
    });

    const createMutation = useMutation((data) => api.create('api/addons', data), mutationOptions('criado'));
    const updateMutation = useMutation((data) => api.update('api/addons', data), mutationOptions('atualizado'));
    const deleteMutation = useMutation((id) => api.delete('api/addons', id), mutationOptions('excluído'));

    const handleSave = (formData) => {
        const dataToSave = { ...formData, price: parseFloat(formData.price), restaurant_id: restaurantId };
        if (editingAddon) {
            updateMutation.mutate({ id: editingAddon.id, ...dataToSave });
        } else {
            createMutation.mutate(dataToSave);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Tem certeza?')) deleteMutation.mutate(id);
    };

    const openModal = (addon = null) => {
        setEditingAddon(addon);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingAddon(null);
        setIsModalOpen(false);
    };

    return (
        <div className="tab-content active">
            <div className="table-container">
                <div className="table-header">
                    <span className="table-title">Todos os Adicionais</span>
                    <button className="btn btn-primary" onClick={() => openModal()}><Icon name="plus" /> Novo Adicional</button>
                </div>
                <table>
                    <thead><tr><th>Nome</th><th>Preço</th><th>Ações</th></tr></thead>
                    <tbody>
                        {isLoading && <tr><td colSpan="3">Carregando...</td></tr>}
                        {isError && <tr><td colSpan="3">Erro ao carregar dados.</td></tr>}
                        {addons?.map(addon => (
                            <tr key={addon.id}>
                                <td>{addon.name}</td>
                                <td>R$ {Number(addon.price).toFixed(2)}</td>
                                <td>
                                    <button className="action-btn edit-btn" onClick={() => openModal(addon)}><Icon name="edit" /></button>
                                    <button className="action-btn delete-btn" onClick={() => handleDelete(addon.id)}><Icon name="trash" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <AddonModal closeModal={closeModal} onSave={handleSave} addon={editingAddon} />}
        </div>
    );
};

const AddonModal = ({ closeModal, onSave, addon }) => {
    const [formData, setFormData] = useState({ name: '', price: '' });

    useEffect(() => {
        if (addon) setFormData({ name: addon.name, price: addon.price });
    }, [addon]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal title={addon ? 'Editar Adicional' : 'Novo Adicional'} closeModal={closeModal}>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Nome*</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" required />
                </div>
                <div className="form-group">
                    <label>Preço* (R$)</label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} className="form-control" required step="0.01" />
                </div>
                <div style={styles.modalFooter}>
                    <button type="button" className='btn btn-secondary' onClick={closeModal}>Cancelar</button>
                    <button type="submit" className='btn btn-primary'>Salvar</button>
                </div>
            </form>
        </Modal>
    );
};

// --- Generic Modal Wrapper ---
const Modal = ({ title, closeModal, children }) => (
    <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
                <h2>{title}</h2>
                <button type="button" onClick={closeModal} style={styles.closeButton}>&times;</button>
            </div>
            <div style={styles.modalBody}>{children}</div>
        </div>
    </div>
);

const styles = {
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: 'white', borderRadius: '8px', padding: '20px', width: '90%', maxWidth: '600px' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' },
    closeButton: { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' },
    modalBody: { minHeight: '150px', maxHeight: '60vh', overflowY: 'auto', padding: '0 10px' }, // Added maxHeight and overflow
    modalFooter: { borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '20px', textAlign: 'right' }
};

export default Menu;
