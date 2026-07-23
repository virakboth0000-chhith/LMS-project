'use client';
import React, { useState } from 'react';
import { Category } from '../lib/data';
import { useAuth } from '../lib/context';
import { useLibrary } from '../lib/libraryContext';

interface CategoriesProps {
  /** Called when a user picks "Choose Books" on a category — navigates to the catalog filtered by it. */
  onChooseBooks?: (categoryId: string) => void;
}

export default function Categories({ onChooseBooks }: CategoriesProps) {
  const { currentUser } = useAuth();
  const canManage = currentUser?.role === 'admin' || currentUser?.role === 'librarian';
  const { categories, addCategory, updateCategory, deleteCategory } = useLibrary();
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const openAdd = () => {
    setEditCategory(null);
    setForm({ name: '', description: '' });
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditCategory(cat);
    setForm({ name: cat.name, description: cat.description });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editCategory) {
      await updateCategory(editCategory.id, form.name, form.description);
    } else {
      await addCategory(form.name, form.description);
    }
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    await deleteCategory(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
          <p className="text-gray-500 text-sm mt-1">{categories.length} categories</p>
        </div>
        {canManage && (
          <button
            onClick={openAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <span>+</span> Add Category
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <span className={`text-sm px-3 py-1 rounded-full font-medium ${cat.color}`}>{cat.name}</span>
              {canManage && (
                <div className="flex gap-1">
                  <button onClick={() => openEdit(cat)} className="text-gray-400 hover:text-indigo-600 p-1 rounded transition-colors text-sm">✏️</button>
                  <button onClick={() => handleDelete(cat.id)} className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors text-sm">🗑️</button>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-3">{cat.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-800">{cat.bookCount}</span>
                <span className="text-sm text-gray-400">books</span>
              </div>
              {!canManage && (
                <button
                  onClick={() => onChooseBooks?.(cat.id)}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                >
                  📚 Choose Books
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 text-lg">{editCategory ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">{editCategory ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}