import React from 'react';
import { X, AlertTriangle, Shield, CheckCircle, Info } from 'lucide-react';

/**
 * Discord 2023+ Style Modal Component (2023+)
 * Features:
 * - Banner header with animated overlay, icon, label
 * - Discord palette Tailwind buttons (confirm/cancel)
 * - Popover for approval/DLP/info
 * - Annotated military logic insertion points (below)
 */

const Modal = ({
  isOpen = false,
  onClose,
  onConfirm,
  title = 'Confirmation Required',
  description = '',
  type = 'approval',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  showCancel = true,
  children
}) => {
  if (!isOpen) return null;
  const iconMap = {
    approval: Shield,
    dlp: AlertTriangle,
    warning: AlertTriangle,
    info: Info,
    success: CheckCircle
  };
  const colorSchemes = {
    approval: {
      icon: 'text-blurple-500',
      iconBg: 'bg-blurple-500/10',
      confirmBg: 'bg-blurple-500 hover:bg-blurple-600',
      confirmText: 'text-white'
    },
    dlp: {
      icon: 'text-red-500',
      iconBg: 'bg-red-500/10',
      confirmBg: 'bg-red-500 hover:bg-red-600',
      confirmText: 'text-white'
    },
    warning: {
      icon: 'text-yellow-500',
      iconBg: 'bg-yellow-500/10',
      confirmBg: 'bg-yellow-500 hover:bg-yellow-600',
      confirmText: 'text-white'
    },
    info: {
      icon: 'text-blue-500',
      iconBg: 'bg-blue-500/10',
      confirmBg: 'bg-blue-500 hover:bg-blue-600',
      confirmText: 'text-white'
    },
    success: {
      icon: 'text-green-500',
      iconBg: 'bg-green-500/10',
      confirmBg: 'bg-green-500 hover:bg-green-600',
      confirmText: 'text-white'
    }
  };
  const Icon = iconMap[type] || Shield;
  const colors = colorSchemes[type] || colorSchemes.approval;
  // ESC close support
  React.useEffect(() => {
    const esc = e => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', esc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', esc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
  // Click outside (backdrop close)
  const handleBackdrop = e => {
    if (e.target === e.currentTarget && onClose) onClose();
  };
  // =================== [MILITARY LOGIC - PRE-RENDER] ===================
  // Insert security validation, classification, OPSEC, access, etc.
  // =====================================================================
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      >
      {/* Animated Overlay Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-200"></div>
      {/* Modal Container */}
      <div className="relative w-full max-w-md mx-4 animate-slideUp">
        {/* Modal Card (Discord dark theme) */}
        <div className="bg-discord-dark-800 rounded-lg shadow-2xl overflow-hidden">
          {/* ================== [MILITARY LOGIC - HEADER] ===================== */}
          {/* Insert classification banners, labels, caveats, SAP here */}
          {/* ================================================================== */}
          {/* Header: Banner + Icon + Label + Close */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full ${colors.iconBg}`}>
                  <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <div className="flex-1 pt-1">
                  <h2 id="modal-title" className="text-xl font-semibold text-discord-text-primary mb-2">{title}</h2>
                  {/* ======= Popover for Approval/DLP/Info ======= */}
                  {/* Optionally render disclosure/popover here for additional information, workflow details, etc. */}
                  {/* E.g. <Popover content="..." trigger="click">[Info]</Popover> */}
                </div>
              </div>
              {/* Close Button */}
              <button onClick={onClose} className="flex-shrink-0 text-discord-text-muted hover:text-discord-text-primary transition-colors rounded-full p-1 hover:bg-discord-dark-700" aria-label="Close modal">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          {/* Content area */}
          <div className="px-6 pb-6">
            {description && (
              <p id="modal-description" className="text-discord-text-secondary text-sm leading-relaxed mb-4">
                {description}
              </p>
            )}
            {/* Custom content below */}
            {children && (<div className="mt-4">{children}</div>)}
            {/* ================== [MILITARY LOGIC - CONTENT] =================== */}
            {/* Insert signatory block, clearance, mission, ROE compliance, etc. */}
            {/* ================================================================= */}
          </div>
          {/* Discord style Button Footer */}
          <div className="bg-discord-dark-900 px-6 py-4 flex justify-end space-x-3">
            {showCancel && (
              <button onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium text-discord-text-primary bg-transparent hover:bg-discord-dark-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-discord-dark-700 focus:ring-offset-discord-dark-900" type="button">
                {cancelText}
              </button>
            )}
            <button onClick={onConfirm} className={`px-4 py-2 rounded-md text-sm font-medium ${colors.confirmBg} ${colors.confirmText} transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-discord-dark-900 shadow-sm`} type="button">
              {confirmText}
            </button>
            {/* ================== [MILITARY LOGIC - ACTIONS] =================== */}
            {/* Action buttons: escalate, override, emergency, secure comms, etc. */}
            {/* ================================================================ */}
          </div>
        </div>
      </div>
      {/* Add Modal Animations (put in global css/tailwind config) */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
export default Modal;
/**
 * Tailwind Discord palette:
 *   tailwind.config.js:
 *     colors: {
 *       'discord-dark-900': '#1e1f22',
 *       'discord-dark-800': '#2b2d31',
 *       'discord-dark-700': '#313338',
 *       'discord-text-primary': '#f2f3f5',
 *       'discord-text-secondary': '#b5bac1',
 *       'discord-text-muted': '#80848e',
 *       'blurple-500': '#5865f2',
 *       'blurple-600': '#4752c4',
 *     }
 */
