import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, item, onConfirm, onCancel, isDeleting }) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden p-6">
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
          Are you sure you want to delete the rate record for{' '}
          <strong className="text-gray-900">
            {item.service} ({item.sr_id})
          </strong>
          ? This action will permanently remove the record and any attached documentation from the Oracle database.
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
