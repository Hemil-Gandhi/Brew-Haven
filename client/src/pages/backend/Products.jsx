import React, { useState, useEffect } from 'react';
import useAppStore from '../../store/useAppStore';
import { Plus, Search, Edit2, Trash2, X, Check, Package as PackageIcon, Upload, Image as ImageIcon } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Products = () => {
  const { products, fetchProducts, createProduct, updateProduct, deleteProduct } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    unit: 'unit',
    tax: 0,
    description: '',
    variants: [],
    image: ''
  });

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setImageFile(null);
    setImagePreview(product.image ? `${API_BASE}${product.image}` : '');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const fd = new FormData();
    fd.append('name', formData.name);
    fd.append('category', formData.category);
    fd.append('price', formData.price);
    fd.append('unit', formData.unit || 'unit');
    fd.append('tax', formData.tax || 0);
    fd.append('description', formData.description || '');
    fd.append('variants', JSON.stringify(formData.variants || []));
    
    if (imageFile) {
      fd.append('image', imageFile);
    } else if (editingProduct && formData.image) {
      fd.append('image', formData.image);
    }
    
    if (editingProduct) {
      await updateProduct(editingProduct._id, fd);
    } else {
      await createProduct(fd);
    }
    setShowModal(false);
    setEditingProduct(null);
    setImageFile(null);
    setImagePreview('');
    setFormData({ name: '', category: '', price: '', unit: 'unit', tax: 0, description: '', variants: [], image: '' });
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { name: '', extraPrice: 0 }]
    });
  };

  const removeVariant = (index) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index)
    });
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryEmoji = (cat) => {
    const map = { 'Coffee': '☕', 'Pastry': '🥐', 'Mains': '🍽️', 'Drinks': '🥤' };
    return map[cat] || '🍴';
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setImageFile(null); setImagePreview(''); setShowModal(true); }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Product</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Category</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Price</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Variants</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map((product) => (
              <tr key={product._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    {product.image ? (
                      <img 
                        src={`${API_BASE}${product.image}`} 
                        alt={product.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-xl border border-slate-100">
                        {getCategoryEmoji(product.category)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-800">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.description || 'No description'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-slate-800">₹{product.price.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {product.variants?.map((v, i) => (
                      <span key={i} className="px-2 py-0.5 bg-indigo-50 text-primary rounded text-[10px] font-bold">
                        {v.name} (+₹{v.extraPrice})
                      </span>
                    ))}
                    {(!product.variants || product.variants.length === 0) && '-'}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button 
                      onClick={() => handleEdit(product)}
                      className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(product._id)}
                      className="p-2 text-slate-400 hover:text-accent hover:bg-accent/5 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-slate-800">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-50 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Product Image</label>
                <div className="flex items-start space-x-4">
                  <div className="relative group">
                    {imagePreview ? (
                      <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                        <ImageIcon className="w-8 h-8 mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="flex items-center justify-center space-x-2 px-4 py-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 hover:border-primary/30 transition-all group">
                      <Upload className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium text-slate-500 group-hover:text-primary transition-colors">
                        {imageFile ? imageFile.name : 'Choose an image...'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-slate-400 font-medium">PNG, JPG, WEBP up to 5MB. Recommended: 400×300px</p>
                    {imagePreview && (
                      <button 
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(''); setFormData({ ...formData, image: '' }); }}
                        className="text-xs text-red-400 hover:text-red-600 font-bold transition-colors"
                      >
                        Remove Image
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. Pizza, Coffee"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="input-field"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tax (%)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.tax}
                    onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  className="input-field h-24 resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Variants</h4>
                  <button type="button" onClick={addVariant} className="text-xs font-bold text-primary flex items-center space-x-1 hover:underline">
                    <Plus className="w-3 h-3" />
                    <span>Add Variant</span>
                  </button>
                </div>
                
                {formData.variants.map((variant, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-3 animate-slide-up">
                    <input
                      type="text"
                      placeholder="Variant Name (e.g. Large)"
                      className="input-field flex-1 !py-4 !text-base"
                      value={variant.name}
                      onChange={(e) => {
                        const newVariants = [...formData.variants];
                        newVariants[index].name = e.target.value;
                        setFormData({ ...formData, variants: newVariants });
                      }}
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Extra Price (₹)"
                      className="input-field w-full sm:w-44 !py-4 !text-base"
                      value={variant.extraPrice}
                      onChange={(e) => {
                        const newVariants = [...formData.variants];
                        newVariants[index].extraPrice = e.target.value;
                        setFormData({ ...formData, variants: newVariants });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="p-3.5 text-slate-400 hover:text-accent hover:bg-accent/10 rounded-xl shrink-0 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex space-x-3 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 rounded-lg font-medium border border-slate-200 hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button type="submit" className="btn-primary px-8">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
