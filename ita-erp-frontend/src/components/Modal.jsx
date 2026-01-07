export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        {children}
        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:underline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
