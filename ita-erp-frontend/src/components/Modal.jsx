import { X } from "lucide-react"; // Optional: npm install lucide-react

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  // Close modal when clicking on the backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={handleBackdropClick}
    >
      {/* Modal Container */}
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h3 className="text-xl font-bold text-gray-900 leading-none">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {children}
        </div>

        {/* Optional Modal Footer (if you want a consistent Cancel button) */}
        <div className="px-6 pb-6 text-center">
          <button
            onClick={onClose}
            className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}