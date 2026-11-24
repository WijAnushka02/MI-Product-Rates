import React, { useState, useEffect } from 'react';
import { Plus, Search, RefreshCw, Layers } from 'lucide-react';
import ProductRateTable from './components/ProductRateTable';
import ProductRateModal from './components/ProductRateModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import Toast from './components/Toast';
import {
  getProductRates,
  createProductRate,
  updateProductRate,
  deleteProductRate,
} from './services/api';

export default function App() {
  const [rates, setRates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Fetch and auto-refresh table
  const fetchRates = async () => {
    setIsLoading(true);
    try {
      const data = await getProductRates(searchQuery);
      setRates(data);
    } catch (err) {
      showToast('Failed to load records from Oracle backend.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, [searchQuery]);

  // Handle Save (Add or Update)
  const handleSave = async (formData, id) => {
    setIsSubmitting(true);
    try {
      if (id) {
        await updateProductRate(id, formData);
        showToast('MI Product Rate updated successfully!', 'success');
      } else {
        const created = await createProductRate(formData);
        showToast(`Record ${created.sr_id} created successfully!`, 'success');
      }
      setIsModalOpen(false);
      setEditItem(null);
      await fetchRates(); // Auto refresh
    } catch (err) {
      const errorMsg =
        err.response?.data?.rate?.[0] ||
        err.response?.data?.service?.[0] ||
        err.response?.data?.executive_level?.[0] ||
        'Error saving rate record.';
      showToast(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleDeleteConfirm = async (id) => {
    setIsDeleting(true);
    try {
      await deleteProductRate(id);
      showToast('Record deleted successfully.', 'success');
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      await fetchRates(); // Auto refresh
    } catch (err) {
      showToast('Failed to delete record.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter rates by status
  const filteredRates = rates.filter((item) => {
    if (filterStatus === 'All') return true;
    return item.status === filterStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

      {/* Corporate Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-lg text-white">
              <Layers size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                SLTMobitel MI Product Rates
              </h1>
              <p className="text-xs text-gray-500">
                Enterprise Rate Management System (Oracle DB Edition)
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditItem(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-sm transition"
          >
            <Plus size={18} />
            Add New Rate
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Controls: Search, Filter, Refresh */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Service, Tier, SR_ID..."
              className="pl-10 pr-4 py-2 text-sm w-full border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-blue-600"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>

            <button
              onClick={fetchRates}
              title="Refresh Table"
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-600 transition"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <ProductRateTable
          rates={filteredRates}
          isLoading={isLoading}
          onEdit={(item) => {
            setEditItem(item);
            setIsModalOpen(true);
          }}
          onDelete={(item) => {
            setItemToDelete(item);
            setIsDeleteModalOpen(true);
          }}
        />
      </main>

      {/* Add / Edit Modal */}
      <ProductRateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        editData={editItem}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        item={itemToDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteModalOpen(false)}
        isDeleting={isDeleting}
      />
    </div>
  );
}
