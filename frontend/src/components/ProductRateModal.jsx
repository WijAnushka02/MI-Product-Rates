import React, { useState, useEffect } from 'react';
import { X, Upload, FileText } from 'lucide-react';

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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6">
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
                    Current file:{' '}
                    <a
                      href={editData.attachment_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      View current attachment
                    </a>
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
