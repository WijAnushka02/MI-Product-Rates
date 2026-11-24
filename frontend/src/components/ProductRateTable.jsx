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

  const handleDownload = async (item) => {
    const targetUrl =
      item.download_url || `http://localhost:8000/api/mi-product-rates/${item.id}/download/`;
    try {
      const response = await fetch(targetUrl);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const rawName = item.attachment
        ? item.attachment.split('/').pop().split('\\').pop()
        : `${item.sr_id}_attachment`;
      a.download = rawName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Fallback: navigate directly to download URL
      window.location.href = targetUrl;
    }
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
        <p className="text-gray-400 text-xs mt-1">Try modifying your search or click "Add New Rate" to create an entry.</p>
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
                <td className="py-3 px-4 font-mono font-semibold text-blue-700 whitespace-nowrap">
                  {item.sr_id}
                </td>
                <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">
                  {item.service}
                </td>
                <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                  {item.executive_level}
                </td>
                <td className="py-3 px-4 font-semibold text-gray-900 text-right whitespace-nowrap">
                  {formatCurrency(item.rate)}
                </td>
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
                <td className="py-3 px-4 whitespace-nowrap">
                  {item.attachment ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDownload(item)}
                        title="Download attachment file"
                        className="inline-flex items-center gap-1.5 text-xs text-blue-700 hover:text-white hover:bg-blue-600 font-medium bg-blue-50 px-2.5 py-1.5 rounded-md border border-blue-200 transition cursor-pointer shadow-xs active:scale-95"
                      >
                        <FileDown size={14} />
                        Download
                      </button>
                      {item.attachment_url && (
                        <a
                          href={item.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open preview in new tab"
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs italic">None</span>
                  )}
                </td>
                <td className="py-3 px-4 text-gray-600 text-xs whitespace-nowrap">
                  {item.created_user}
                </td>
                <td className="py-3 px-4 text-gray-500 text-xs whitespace-nowrap">
                  {formatDate(item.updated_date)}
                </td>
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
