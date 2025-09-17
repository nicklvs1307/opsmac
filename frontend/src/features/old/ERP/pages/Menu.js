import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useToggleCategoryStatus,
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useToggleProductStatus,
  useAddons,
  useCreateAddon,
  useUpdateAddon,
  useDeleteAddon,
  useToggleAddonStatus,
} from '@/features/ERP/api/erpQueries';

const Icon = ({ name }) => <i className={`fas fa-${name}`}></i>;

const Menu = () => {
  const [activeTab, setActiveTab] = useState('categories');

  const renderContent = () => {
    switch (activeTab) {
      case 'categories':
        return <CategoriesTab />;
      case 'products':
        return <ProductsTab />;
      case 'addons':
        return <AddonsTab />;
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
      </div>
      <div className="block">{renderContent()}</div>
    </div>
  );
};

// --- Categories Tab ---
const CategoriesTab = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const restaurantId = user?.restaurants[0]?.id;

  const { data: categories, isLoading, isError } = useCategories(restaurantId);

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const toggleStatusMutation = useToggleCategoryStatus();

  const handleSave = (formData) => {
    const dataToSave = { ...formData, restaurant_id: user?.restaurants[0]?.id };
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, fields: dataToSave });
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
    <div className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <span className="text-lg font-semibold">Todas as Categorias</span>
          <button
            className="px-4 py-2 border-none rounded-md cursor-pointer font-medium transition-all duration-300 inline-flex items-center justify-center bg-blue-500 text-white hover:bg-blue-600"
            onClick={() => openModal()}
          >
            <Icon name="plus" className="mr-2" /> Nova Categoria
          </button>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left border-b border-gray-200 font-semibold text-gray-800 text-sm">
                Nome
              </th>
              <th className="p-3 text-left border-b border-gray-200 font-semibold text-gray-800 text-sm">
                Descrição
              </th>
              <th className="p-3 text-left border-b border-gray-200 font-semibold text-gray-800 text-sm">
                Status
              </th>
              <th className="p-3 text-left border-b border-gray-200 font-semibold text-gray-800 text-sm">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="4" className="p-3 text-left border-b border-gray-200">
                  Carregando...
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan="4" className="p-3 text-left border-b border-gray-200">
                  Erro ao carregar dados.
                </td>
              </tr>
            )}
            {categories?.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="p-3 text-left border-b border-gray-200">{category.name}</td>
                <td className="p-3 text-left border-b border-gray-200">{category.description}</td>
                <td className="p-3 text-left border-b border-gray-200">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${category.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                  >
                    {category.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="p-3 text-left border-b border-gray-200">
                  <button
                    className={`p-1 px-2 border-none rounded-md cursor-pointer mr-1 text-sm transition-all duration-300 bg-transparent text-white ${category.is_active ? 'bg-yellow-500' : 'bg-green-500'}`}
                    onClick={() => toggleStatusMutation.mutate(category.id)}
                    title={category.is_active ? 'Inativar' : 'Ativar'}
                  >
                    <Icon name={category.is_active ? 'toggle-off' : 'toggle-on'} />
                  </button>
                  <button
                    className="p-1 px-2 border-none rounded-md cursor-pointer mr-1 text-sm transition-all duration-300 bg-transparent text-blue-500 hover:bg-blue-100"
                    onClick={() => openModal(category)}
                  >
                    <Icon name="edit" />
                  </button>
                  <button
                    className="p-1 px-2 border-none rounded-md cursor-pointer mr-1 text-sm transition-all duration-300 bg-transparent text-red-500 hover:bg-red-100"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Icon name="trash" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <CategoryModal closeModal={closeModal} onSave={handleSave} category={editingCategory} />
      )}
    </div>
  );
};

const CategoryModal = ({ closeModal, onSave, category }) => {
  const [formData, setFormData] = useState({ name: '', description: '', is_active: true });

  useEffect(() => {
    if (category)
      setFormData({
        name: category.name,
        description: category.description,
        is_active: category.is_active,
      });
  }, [category]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal title={category ? 'Editar Categoria' : 'Nova Categoria'} closeModal={closeModal}>
      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label className="block mb-2 font-medium text-gray-800">Nome*</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md text-sm transition-all duration-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>
        <div className="mb-5">
          <label className="block mb-2 font-medium text-gray-800">Descrição</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md text-sm transition-all duration-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            rows="3"
          ></textarea>
        </div>
        <div className="mb-5">
          <label className="block mb-2 font-medium text-gray-800">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="mr-2"
            />{' '}
            Categoria Ativa
          </label>
        </div>
        <div className="border-t border-gray-200 pt-2 mt-4 text-right">
          <button
            type="button"
            className="px-4 py-2 border-none rounded-md cursor-pointer font-medium transition-all duration-300 inline-flex items-center justify-center bg-gray-400 text-white hover:bg-gray-500 mr-2"
            onClick={closeModal}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 border-none rounded-md cursor-pointer font-medium transition-all duration-300 inline-flex items-center justify-center bg-blue-500 text-white hover:bg-blue-600"
          >
            Salvar
          </button>
        </div>
      </form>
    </Modal>
  );
};

// --- Products Tab ---
const ProductsTab = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const restaurantId = user?.restaurants[0]?.id;

  const { data: products, isLoading, isError } = useProducts(restaurantId);
  const { data: categories } = useCategories(restaurantId);

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const toggleStatusMutation = useToggleProductStatus();

  const handleSave = (formData) => {
    const dataToSave = {
      ...formData,
      price: parseFloat(formData.price),
      restaurant_id: restaurantId,
    };
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, fields: dataToSave });
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
    <div className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <span className="text-lg font-semibold">Todos os Produtos</span>
          <button
            className="px-4 py-2 border-none rounded-md cursor-pointer font-medium transition-all duration-300 inline-flex items-center justify-center bg-blue-500 text-white hover:bg-blue-600"
            onClick={() => openModal()}
          >
            <Icon name="plus" className="mr-2" /> Novo Produto
          </button>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left border-b border-gray-200 font-semibold text-gray-800 text-sm">
                Nome
              </th>
              <th className="p-3 text-left border-b border-gray-200 font-semibold text-gray-800 text-sm">
                Categoria
              </th>
              <th className="p-3 text-left border-b border-gray-200 font-semibold text-gray-800 text-sm">
                Preço
              </th>
              <th className="p-3 text-left border-b border-gray-200 font-semibold text-gray-800 text-sm">
                Status
              </th>
              <th className="p-3 text-left border-b border-gray-200 font-semibold text-gray-800 text-sm">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="5" className="p-3 text-left border-b border-gray-200">
                  Carregando...
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan="5" className="p-3 text-left border-b border-gray-200">
                  Erro ao carregar dados.
                </td>
              </tr>
            )}
            {products?.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="p-3 text-left border-b border-gray-200">{product.name}</td>
                <td className="p-3 text-left border-b border-gray-200">{product.category?.name}</td>
                <td className="p-3 text-left border-b border-gray-200">
                  R$ {Number(product.price).toFixed(2)}
                </td>
                <td className="p-3 text-left border-b border-gray-200">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                  >
                    {product.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="p-3 text-left border-b border-gray-200">
                  <button
                    className={`p-1 px-2 border-none rounded-md cursor-pointer mr-1 text-sm transition-all duration-300 bg-transparent text-white ${product.is_active ? 'bg-yellow-500' : 'bg-green-500'}`}
                    onClick={() => toggleStatusMutation.mutate(product.id)}
                    title={product.is_active ? 'Inativar' : 'Ativar'}
                  >
                    <Icon name={product.is_active ? 'toggle-off' : 'toggle-on'} />
                  </button>
                  <button
                    className="p-1 px-2 border-none rounded-md cursor-pointer mr-1 text-sm transition-all duration-300 bg-transparent text-blue-500 hover:bg-blue-100"
                    onClick={() => openModal(product)}
                  >
                    <Icon name="edit" />
                  </button>
                  <button
                    className="p-1 px-2 border-none rounded-md cursor-pointer mr-1 text-sm transition-all duration-300 bg-transparent text-red-500 hover:bg-red-100"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Icon name="trash" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <ProductModal
          closeModal={closeModal}
          onSave={handleSave}
          product={editingProduct}
          categories={categories}
        />
      )}
    </div>
  );
};

const ProductModal = ({ closeModal, onSave, product, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    is_active: true,
    variations: [],
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category_id: product.category_id,
        is_active: product.is_active,
        variations: product.variations || [], // Ensure variations is an array
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleVariationChange = (index, field, value) => {
    const newVariations = [...formData.variations];
    newVariations[index][field] = value;
    setFormData((prev) => ({ ...prev, variations: newVariations }));
  };

  const addVariation = () => {
    setFormData((prev) => ({ ...prev, variations: [...prev.variations, { name: '', price: '' }] }));
  };

  const removeVariation = (index) => {
    const newVariations = formData.variations.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, variations: newVariations }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal title={product ? 'Editar Produto' : 'Novo Produto'} closeModal={closeModal}>
      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label className="block mb-2 font-medium text-gray-800">Nome*</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md text-sm transition-all duration-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>
        <div className="mb-5">
          <label className="block mb-2 font-medium text-gray-800">Categoria*</label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md text-sm transition-all duration-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          >
            <option value="">Selecione...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-5">
          <label className="block mb-2 font-medium text-gray-800">Descrição</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md text-sm transition-all duration-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            rows="3"
          ></textarea>
        </div>
        <div className="mb-5">
          <label className="block mb-2 font-medium text-gray-800">Preço* (R$)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md text-sm transition-all duration-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
            step="0.01"
          />
        </div>
        <div className="mb-5">
          <label className="block mb-2 font-medium text-gray-800">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="mr-2"
            />{' '}
            Produto Ativo
          </label>
        </div>

        <div className="mb-5">
          <label className="block mb-2 font-medium text-gray-800">Variações</label>
          <div className="mt-2 pt-2 border-t border-gray-200">
            {formData.variations.map((variation, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  value={variation.name}
                  onChange={(e) => handleVariationChange(index, 'name', e.target.value)}
                  className="flex-1 w-full p-3 border border-gray-300 rounded-md text-sm transition-all duration-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Nome da Variação (Ex: Grande)"
                />
                <input
                  type="number"
                  value={variation.price}
                  onChange={(e) => handleVariationChange(index, 'price', e.target.value)}
                  className="flex-1 w-full p-3 border border-gray-300 rounded-md text-sm transition-all duration-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Preço Adicional"
                  step="0.01"
                />
                <button
                  type="button"
                  onClick={() => removeVariation(index)}
                  className="px-2 py-1 border-none rounded-md cursor-pointer font-medium transition-all duration-300 inline-flex items-center justify-center bg-gray-400 text-white hover:bg-gray-500"
                >
                  <Icon name="trash" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addVariation}
              className="px-4 py-2 border-none rounded-md cursor-pointer font-medium transition-all duration-300 inline-flex items-center justify-center bg-gray-400 text-white hover:bg-gray-500 mt-2"
            >
              <Icon name="plus" className="mr-2" /> Adicionar Variação
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-2 mt-4 text-right">
          <button
            type="button"
            className="px-4 py-2 border-none rounded-md cursor-pointer font-medium transition-all duration-300 inline-flex items-center justify-center bg-gray-400 text-white hover:bg-gray-500 mr-2"
            onClick={closeModal}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 border-none rounded-md cursor-pointer font-medium transition-all duration-300 inline-flex items-center justify-center bg-blue-500 text-white hover:bg-blue-600"
          >
            Salvar
          </button>
        </div>
      </form>
    </Modal>
  );
};

// --- Addons Tab ---
const AddonsTab = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState(null);

  const restaurantId = user?.restaurants[0]?.id;

  const { data: addons, isLoading, isError } = useAddons(restaurantId);

  const createMutation = useCreateAddon();
  const updateMutation = useUpdateAddon();
  const deleteMutation = useDeleteAddon();
  const toggleStatusMutation = useToggleAddonStatus();

  const handleSave = (formData) => {
    const dataToSave = {
      ...formData,
      price: parseFloat(formData.price),
      restaurant_id: restaurantId,
    };
    if (editingAddon) {
      updateMutation.mutate({ id: editingAddon.id, fields: dataToSave });
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
    <div className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <span className="text-lg font-semibold">Todos os Adicionais</span>
          <button
            className="px-4 py-2 border-none rounded-md cursor-pointer font-medium transition-all duration-300 inline-flex items-center justify-center bg-blue-500 text-white hover:bg-blue-600"
            onClick={() => openModal()}
          >
            <Icon name="plus" className="mr-2" /> Novo Adicional
          </button>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left border-b border-gray-200 font-semibold text-gray-800 text-sm">
                Nome
              </th>
              <th className="p-3 text-left border-b border-gray-200 font-semibold text-gray-800 text-sm">
                Preço
              </th>
              <th className="p-3 text-left border-b border-gray-200 font-semibold text-gray-800 text-sm">
                Status
              </th>
              <th className="p-3 text-left border-b border-gray-200 font-semibold text-gray-800 text-sm">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="4" className="p-3 text-left border-b border-gray-200">
                  Carregando...
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan="4" className="p-3 text-left border-b border-gray-200">
                  Erro ao carregar dados.
                </td>
              </tr>
            )}
            {addons?.map((addon) => (
              <tr key={addon.id} className="hover:bg-gray-50">
                <td className="p-3 text-left border-b border-gray-200">{addon.name}</td>
                <td className="p-3 text-left border-b border-gray-200">
                  R$ {Number(addon.price).toFixed(2)}
                </td>
                <td className="p-3 text-left border-b border-gray-200">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${addon.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                  >
                    {addon.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="p-3 text-left border-b border-gray-200">
                  <button
                    className={`p-1 px-2 border-none rounded-md cursor-pointer mr-1 text-sm transition-all duration-300 bg-transparent text-white ${addon.is_active ? 'bg-yellow-500' : 'bg-green-500'}`}
                    onClick={() => toggleStatusMutation.mutate(addon.id)}
                    title={addon.is_active ? 'Inativar' : 'Ativar'}
                  >
                    <Icon name={addon.is_active ? 'toggle-off' : 'toggle-on'} />
                  </button>
                  <button
                    className="p-1 px-2 border-none rounded-md cursor-pointer mr-1 text-sm transition-all duration-300 bg-transparent text-blue-500 hover:bg-blue-100"
                    onClick={() => openModal(addon)}
                  >
                    <Icon name="edit" />
                  </button>
                  <button
                    className="p-1 px-2 border-none rounded-md cursor-pointer mr-1 text-sm transition-all duration-300 bg-transparent text-red-500 hover:bg-red-100"
                    onClick={() => handleDelete(addon.id)}
                  >
                    <Icon name="trash" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <AddonModal closeModal={closeModal} onSave={handleSave} addon={editingAddon} />
      )}
    </div>
  );
};

const AddonModal = ({ closeModal, onSave, addon }) => {
  const [formData, setFormData] = useState({ name: '', price: '', is_active: true });

  useEffect(() => {
    if (addon) setFormData({ name: addon.name, price: addon.price, is_active: addon.is_active });
  }, [addon]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal title={addon ? 'Editar Adicional' : 'Novo Adicional'} closeModal={closeModal}>
      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label className="block mb-2 font-medium text-gray-800">Nome*</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md text-sm transition-all duration-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>
        <div className="mb-5">
          <label className="block mb-2 font-medium text-gray-800">Preço* (R$)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md text-sm transition-all duration-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
            step="0.01"
          />
        </div>
        <div className="mb-5">
          <label className="block mb-2 font-medium text-gray-800">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="mr-2"
            />{' '}
            Adicional Ativo
          </label>
        </div>
        <div className="border-t border-gray-200 pt-2 mt-4 text-right">
          <button
            type="button"
            className="px-4 py-2 border-none rounded-md cursor-pointer font-medium transition-all duration-300 inline-flex items-center justify-center bg-gray-400 text-white hover:bg-gray-500 mr-2"
            onClick={closeModal}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 border-none rounded-md cursor-pointer font-medium transition-all duration-300 inline-flex items-center justify-center bg-blue-500 text-white hover:bg-blue-600"
          >
            Salvar
          </button>
        </div>
      </form>
    </Modal>
  );
};

// --- Generic Modal Wrapper ---
const Modal = ({ title, closeModal, children }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg p-5 w-11/12 max-w-xl">
      <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-4">
        <h2>{title}</h2>
        <button
          type="button"
          onClick={closeModal}
          className="bg-transparent border-none text-2xl cursor-pointer"
        >
          &times;
        </button>
      </div>
      <div className="min-h-36 max-h-96 overflow-y-auto px-2">{children}</div>
    </div>
  </div>
);

export default Menu;
