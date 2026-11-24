import React, { useState, useEffect } from 'react';
import { Plus, Search, RefreshCw, Layers, X, Filter } from 'lucide-react';
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
  
  // Search state: searchInput (typed text) vs activeSearch (submitted query)
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
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

  // Fetch from backend
  const fetchRates = async (query = activeSearch) => {
    setIsLoading(true);
    try {
      const data = await getProductRates(query);
      setRates(data);
    } catch (err) {
      showToast('Failed to load records from Oracle backend.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchRates('');
  }, []);

  // Handle Search submit (via Search button or Enter key)
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const query = searchInput.trim();
    setActiveSearch(query);
    fetchRates(query);
  };

  // Handle Reset / Clear search
  const handleClearSearch = () => {
    setSearchInput('');
    setActiveSearch('');
    fetchRates('');
  };

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
      await fetchRates(activeSearch); // Auto refresh
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
      await fetchRates(activeSearch); // Auto refresh
    } catch (err) {
      showToast('Failed to delete record.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Comprehensive client-side filtering (Status + Search across all relevant fields)
  const filteredRates = rates.filter((item) => {
    // 1. Status Filter
    if (filterStatus !== 'All' && item.status !== filterStatus) {
      return false;
    }
    // 2. Active Search Query Filter
    if (!activeSearch.trim()) return true;
    const q = activeSearch.toLowerCase().trim();
    return (
      (item.sr_id && item.sr_id.toLowerCase().includes(q)) ||
      (item.service && item.service.toLowerCase().includes(q)) ||
      (item.executive_level && item.executive_level.toLowerCase().includes(q)) ||
      (item.created_user && item.created_user.toLowerCase().includes(q)) ||
      (item.comments && item.comments.toLowerCase().includes(q)) ||
      (item.status && item.status.toLowerCase().includes(q)) ||
      (item.rate !== undefined && item.rate !== null && item.rate.toString().includes(q))
    );
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
        {/* Controls: Search Bar with Dedicated Search Button, Status Filter, Refresh */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
            {/* Search Input with Search & Clear Buttons */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto flex-1 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by Service, Tier, SR_ID, User..."
                  className="pl-10 pr-9 py-2 text-sm w-full border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                    title="Clear search input"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Explicit Search Button */}
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95"
              >
                <Search size={16} />
                Search
              </button>

              {/* Reset button if active search is applied */}
              {activeSearch && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="border border-gray-300 hover:bg-gray-100 text-gray-600 text-sm font-medium px-3 py-2 rounded-lg transition whitespace-nowrap cursor-pointer"
                >
                  Reset
                </button>
              )}
            </form>

            {/* Status Filter & Refresh */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Filter size={16} />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active Only</option>
                  <option value="Inactive">Inactive Only</option>
                </select>
              </div>

              <button
                onClick={() => fetchRates(activeSearch)}
                title="Refresh Table from Oracle Database"
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-600 transition cursor-pointer"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          {/* Active Search / Filter Status Banner */}
          {(activeSearch || filterStatus !== 'All') && (
            <div className="flex items-center justify-between bg-blue-50/60 border border-blue-100 px-3.5 py-1.5 rounded-lg text-xs text-blue-800">
              <div className="flex items-center gap-2">
                <span>Showing <strong>{filteredRates.length}</strong> of <strong>{rates.length}</strong> records</span>
                {activeSearch && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    Search: "{activeSearch}"
                  </span>
                )}
                {filterStatus !== 'All' && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    Status: {filterStatus}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setFilterStatus('All');
                  handleClearSearch();
                }}
                className="text-blue-600 hover:text-blue-800 font-medium underline cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          )}
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
