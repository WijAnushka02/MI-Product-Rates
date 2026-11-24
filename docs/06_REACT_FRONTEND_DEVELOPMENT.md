# Document 06: Tasks 04 & 05 — React.js Frontend Development

This document covers **Task 04: Frontend Development** and **Task 05: Functional Implementation** using **React.js** (bootstrapped with Vite), Axios, and a modern, responsive design.

---

## 1. Initializing the React.js Project

Run the following commands in your workspace root:

```bash
# In workspace root
cd "d:\Anushka_1\HIGHER EDUCATION\Degree Level_(BSc(Hon's))_Software Engineering\UoK\ACADEMIC\Year 3\Semester 6\SLTMobitel Intern\MI Product Rates"

# Create Vite React app
npm create vite@latest frontend -- --template react

# Navigate into frontend
cd frontend

# Install dependencies (Axios for HTTP requests, Lucide React for professional icons)
npm install axios lucide-react

# Install and configure Tailwind CSS for modern responsive styling
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## 2. Configuring Tailwind CSS

Update `frontend/tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slt: {
          blue: '#005baa',
          darkBlue: '#003e7e',
          lightBlue: '#e6f0fa',
          green: '#00a651'
        }
      }
    },
  },
  plugins: [],
}
```

Update `frontend/src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: #f8fafc;
  color: #1e293b;
}
```

---

## 3. API Service Layer (`src/services/api.js`)

Create `frontend/src/services/api.js` to manage all communications with the Django REST Framework backend:

```javascript
// frontend/src/services/api.js

import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/mi-product-rates/';

const apiClient = axios.create({
  baseURL: BASE_URL,
});

/**
 * Fetch list of all product rates, with optional search query
 */
export const getProductRates = async (searchQuery = '') => {
  const url = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
  const response = await apiClient.get(url);
  return response.data;
};

/**
 * Fetch a single product rate by ID
 */
export const getProductRateById = async (id) => {
  const response = await apiClient.get(`${id}/`);
  return response.data;
};

/**
 * Create a new product rate (supports multipart/form-data for attachments)
 */
export const createProductRate = async (formData) => {
  const response = await apiClient.post('', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Update an existing product rate (PATCH supports partial fields & files)
 */
export const updateProductRate = async (id, formData) => {
  const response = await apiClient.patch(`${id}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Delete a product rate by ID
 */
export const deleteProductRate = async (id) => {
  const response = await apiClient.delete(`${id}/`);
  return response.data;
};
```

---

## 4. Toast Notification Component (`src/components/Toast.jsx`)

Create `frontend/src/components/Toast.jsx` to render clear success and error messages:

```jsx
// frontend/src/components/Toast.jsx

import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white transition-all transform duration-300 ${
      isSuccess ? 'bg-emerald-600' : 'bg-rose-600'
    }`}>
      {isSuccess ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="text-white hover:text-gray-200 ml-2">
        <X size={16} />
      </button>
    </div>
  );
}
```

---

## 5. Delete Confirmation Modal (`src/components/DeleteConfirmModal.jsx`)

Create `frontend/src/components/DeleteConfirmModal.jsx` to guard against accidental deletions:

```jsx
// frontend/src/components/DeleteConfirmModal.jsx

import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, item, onConfirm, onCancel, isDeleting }) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden p-6 animate-fadeIn">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle size={24} />
            <h3 className="text-lg font-semibold text-gray-800">Confirm Deletion</h3>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="py-4 text-gray-600 text-sm leading-relaxed">
          Are you sure you want to delete the rate record for 
          <strong className="text-gray-900"> {item.service} ({item.sr_id})</strong>? 
          This action will permanently delete the rate and any attached documentation from the Oracle database.
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(item.id)}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition flex items-center gap-2"
          >
            <Trash2 size={16} />
            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 6. Add & Edit Modal Form (`src/components/ProductRateModal.jsx`)

Create `frontend/src/components/ProductRateModal.jsx` with input validation, decimal checking, and file picker:

```jsx
// frontend/src/components/ProductRateModal.jsx

import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, CheckCircle } from 'lucide-react';

export default function ProductRateModal({ isOpen, onClose, onSave, editData, isSubmitting }) {
  const [formData, setFormData] = useState({
    service: '',
    executive_level: '',
    rate: '',
    status: 'Active',
    created_user: 'anushka_intern',
    comments: '',
  });

  const [attachmentFile, setAttachmentFile] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setFormData({
        service: editData.service || '',
        executive_level: editData.executive_level || '',
        rate: editData.rate || '',
        status: editData.status || 'Active',
        created_user: editData.created_user || 'anushka_intern',
        comments: editData.comments || '',
      });
      setAttachmentFile(null);
    } else {
      setFormData({
        service: '',
        executive_level: '',
        rate: '',
        status: 'Active',
        created_user: 'anushka_intern',
        comments: '',
      });
      setAttachmentFile(null);
    }
    setErrors({});
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const err = {};
    if (!formData.service.trim()) err.service = 'Service Name is required.';
    if (!formData.executive_level.trim()) err.executive_level = 'Executive Level is required.';
    
    // Decimal Rate Validation
    if (!formData.rate) {
      err.rate = 'Rate is required.';
    } else {
      const rateNum = Number(formData.rate);
      if (isNaN(rateNum) || rateNum < 0) {
        err.rate = 'Rate must be a positive number.';
      } else if (!/^\d+(\.\d{1,2})?$/.test(formData.rate.toString())) {
        err.rate = 'Rate must have at most 2 decimal places (e.g., 125000.50).';
      }
    }

    if (attachmentFile) {
      const allowed = ['pdf', 'doc', 'docx', 'xlsx', 'xls', 'png', 'jpg', 'jpeg'];
      const ext = attachmentFile.name.split('.').pop().toLowerCase();
      if (!allowed.includes(ext)) {
        err.attachment = `Invalid file type .${ext}. Allowed: ${allowed.join(', ')}`;
      }
      if (attachmentFile.size > 10 * 1024 * 1024) {
        err.attachment = 'File exceeds maximum 10MB limit.';
      }
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Build FormData payload
    const data = new FormData();
    data.append('service', formData.service.trim());
    data.append('executive_level', formData.executive_level.trim());
    data.append('rate', parseFloat(formData.rate).toFixed(2));
    data.append('status', formData.status);
    data.append('comments', formData.comments.trim());

    if (editData) {
      data.append('updated_user', 'anushka_intern');
    } else {
      data.append('created_user', formData.created_user.trim());
    }

    if (attachmentFile) {
      data.append('attachment', attachmentFile);
    }

    onSave(data, editData ? editData.id : null);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 animate-fadeIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {editData ? `Edit Rate Record (${editData.sr_id})` : 'Add New MI Product Rate'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Service Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Service Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              placeholder="e.g., Dedicated Internet Access"
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
                errors.service ? 'border-rose-500 ring-1 ring-rose-500' : 'border-gray-300 focus:border-blue-600'
              }`}
            />
            {errors.service && <p className="text-xs text-rose-500 mt-1">{errors.service}</p>}
          </div>

          {/* Executive Level */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Executive Level <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.executive_level}
              onChange={(e) => setFormData({ ...formData, executive_level: e.target.value })}
              placeholder="e.g., Enterprise Gold, Tier 1 Executive"
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
                errors.executive_level ? 'border-rose-500 ring-1 ring-rose-500' : 'border-gray-300 focus:border-blue-600'
              }`}
            />
            {errors.executive_level && <p className="text-xs text-rose-500 mt-1">{errors.executive_level}</p>}
          </div>

          {/* Rate & Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Rate (LKR) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                placeholder="125000.50"
                className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
                  errors.rate ? 'border-rose-500 ring-1 ring-rose-500' : 'border-gray-300 focus:border-blue-600'
                }`}
              />
              {errors.rate && <p className="text-xs text-rose-500 mt-1">{errors.rate}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-600"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* User Name */}
          {!editData && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Created User
              </label>
              <input
                type="text"
                value={formData.created_user}
                onChange={(e) => setFormData({ ...formData, created_user: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          )}

          {/* Attachment File Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Attachment (Optional Document)
            </label>
            <div className="mt-1 flex items-center justify-center px-6 pt-4 pb-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <div className="text-xs text-gray-600">
                  <label className="relative cursor-pointer font-medium text-blue-600 hover:text-blue-500">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      className="sr-only"
                      onChange={(e) => setAttachmentFile(e.target.files[0])}
                    />
                  </label>
                  <p className="text-gray-500">PDF, DOCX, XLSX, PNG up to 10MB</p>
                </div>
                {attachmentFile && (
                  <p className="text-xs text-emerald-600 font-semibold flex items-center justify-center gap-1 mt-1">
                    <FileText size={14} /> Selected: {attachmentFile.name}
                  </p>
                )}
                {editData && editData.attachment_url && !attachmentFile && (
                  <p className="text-xs text-gray-500 mt-1">
                    Current file: <a href={editData.attachment_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">View current attachment</a>
                  </p>
                )}
              </div>
            </div>
            {errors.attachment && <p className="text-xs text-rose-500 mt-1">{errors.attachment}</p>}
          </div>

          {/* Comments */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Comments (Optional)
            </label>
            <textarea
              rows="2"
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              placeholder="Enter optional remarks..."
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-600"
            ></textarea>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              {isSubmitting ? 'Saving...' : editData ? 'Update Record' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

## 7. Main Table Component (`src/components/ProductRateTable.jsx`)

Create `frontend/src/components/ProductRateTable.jsx` to render the responsive table, filter bars, and action links:

```jsx
// frontend/src/components/ProductRateTable.jsx

import React from 'react';
import { Edit2, Trash2, FileDown, ExternalLink } from 'lucide-react';

export default function ProductRateTable({ rates, onEdit, onDelete, isLoading }) {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        Loading MI Product Rates from Oracle Database...
      </div>
    );
  }

  if (rates.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-200 mt-4">
        <p className="text-gray-500 text-base font-medium">No MI Product Rates records found.</p>
        <p className="text-gray-400 text-xs mt-1">Click "Add New Rate" to create your first entry.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider text-xs font-semibold">
            <tr>
              <th className="py-3.5 px-4">SR ID</th>
              <th className="py-3.5 px-4">Service</th>
              <th className="py-3.5 px-4">Executive Level</th>
              <th className="py-3.5 px-4 text-right">Rate</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4">Attachment</th>
              <th className="py-3.5 px-4">Created User</th>
              <th className="py-3.5 px-4">Updated Date</th>
              <th className="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rates.map((item) => (
              <tr key={item.id} className="hover:bg-blue-50/40 transition">
                {/* SR_ID */}
                <td className="py-3 px-4 font-mono font-semibold text-blue-700 whitespace-nowrap">
                  {item.sr_id}
                </td>

                {/* Service */}
                <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">
                  {item.service}
                </td>

                {/* Executive Level */}
                <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                  {item.executive_level}
                </td>

                {/* Rate */}
                <td className="py-3 px-4 font-semibold text-gray-900 text-right whitespace-nowrap">
                  {formatCurrency(item.rate)}
                </td>

                {/* Status Badge */}
                <td className="py-3 px-4 text-center whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                {/* Attachment Link */}
                <td className="py-3 px-4 whitespace-nowrap">
                  {item.attachment_url ? (
                    <a
                      href={item.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-2 py-1 rounded border border-blue-200"
                    >
                      <FileDown size={14} />
                      Download
                    </a>
                  ) : (
                    <span className="text-gray-400 text-xs italic">None</span>
                  )}
                </td>

                {/* Created User */}
                <td className="py-3 px-4 text-gray-600 text-xs whitespace-nowrap">
                  {item.created_user}
                </td>

                {/* Updated Date */}
                <td className="py-3 px-4 text-gray-500 text-xs whitespace-nowrap">
                  {formatDate(item.updated_date)}
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      title="Edit Record"
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(item)}
                      title="Delete Record"
                      className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## 8. Root App Component (`src/App.jsx`)

Update `frontend/src/App.jsx` to orchestrate state, search, modals, and auto-refresh:

```jsx
// frontend/src/App.jsx

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

  // Fetch / Auto-Refresh Table
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
      const msg = err.response?.data?.rate?.[0] || 'Error saving rate record.';
      showToast(msg, 'error');
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

  // Client-side filtering by status
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

      {/* Main Content Area */}
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
```

---

## 9. Running the React Frontend

Run the Vite dev server:

```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173/` in your browser. The application is now fully responsive, with decimal rate validation, file attachments, and auto-refreshing CRUD functionality!

Proceed to **[07_EXECUTION_AND_TROUBLESHOOTING_GUIDE.md](file:///d:/Anushka_1/HIGHER%20EDUCATION/Degree%20Level_(BSc(Hon's))_Software%20Engineering/UoK/ACADEMIC/Year%203/Semester%206/SLTMobitel%20Intern/MI%20Product%20Rates/docs/07_EXECUTION_AND_TROUBLESHOOTING_GUIDE.md)** for execution commands and troubleshooting steps.
