"use client";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  habitName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  isOpen,
  habitName,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in-backdrop"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl animate-slide-up-scale dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          Delete Habit
        </h2>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          Are you sure you want to delete <strong className="font-semibold">"{habitName}"</strong>? This
          action cannot be undone and all your progress will be lost.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-300 px-5 py-3 font-medium text-gray-700 transition-all duration-200 hover:scale-105 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 active:scale-95 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-gray-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-600 px-5 py-3 font-medium text-white shadow-md transition-all duration-200 hover:scale-105 hover:bg-red-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 active:scale-95"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
