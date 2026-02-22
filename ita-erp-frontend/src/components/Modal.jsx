import { X } from "lucide-react";
import { useEffect } from "react";

export default function Modal({ 
  open, 
  onClose, 
  title, 
  children, 
  maxWidth = "max-w-md",
  showFooter = false, // Control whether to show footer
  primaryAction = null, // Custom primary action button
  primaryText = "Confirm", // Default primary button text
  onPrimary = null // Primary button click handler
}) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      
      {/* --- BACKDROP --- */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-300" 
        onClick={onClose}
      />

      {/* --- MODAL CONTAINER --- */}
      <div 
        className={`
          relative bg-white w-full ${maxWidth} 
          /* Mobile Styles: Slide up from bottom */
          rounded-t-[2rem] sm:rounded-3xl 
          /* Shadow & Animation */
          shadow-[0_20px_50px_rgba(0,0,0,0.2)] 
          transform transition-all ease-out
          animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300
          flex flex-col max-h-[90vh]
        `}
        role="dialog"
        aria-modal="true"
      >
        {/* Mobile Pull Indicator (Cosmetic) */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 sm:hidden" />

        {/* --- HEADER --- */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-800 leading-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Please complete the details below</p>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-90"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* --- CONTENT (Scrollable) --- */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {children}
        </div>

        {/* --- FOOTER (Conditional) --- */}
        {showFooter && (
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200/50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            
            {/* Custom Primary Action or Default */}
            {primaryAction ? (
              primaryAction
            ) : (
              <button
                onClick={onPrimary || onClose}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 rounded-xl transition-all active:transform active:scale-95"
              >
                {primaryText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}