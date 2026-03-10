import React from "react";

export function ConfirmDeleteModal({ open, onClose, onConfirm, message }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-sm w-full text-center shadow-lg">
        <p className="mb-6 text-lg dark:text-white">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold"
          >
            Yes, Delete
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 dark:bg-slate-700 dark:text-white px-4 py-2 rounded-lg font-bold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
