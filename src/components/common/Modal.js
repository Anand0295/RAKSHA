import React from 'react';
import { X, AlertTriangle, Shield, CheckCircle, Info } from 'lucide-react';

/**
 * Discord 2023+ Style Modal Component
 * 
 * Features:
 * - Animated overlay with backdrop blur
 * - Icon/badge header for event categorization
 * - Confirm/Cancel buttons using Discord color palette
 * - Responsive design with Tailwind CSS
 * - Accessibility features (ARIA labels, keyboard support)
 * 
 * Props:
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Callback when modal is closed
 * @param {function} onConfirm - Callback when confirm button is clicked
 * @param {string} title - Modal title
 * @param {string} description - Modal description/content
 * @param {string} type - Modal type: 'approval', 'dlp', 'warning', 'info', 'success'
 * @param {string} confirmText - Text for confirm button (default: 'Confirm')
 * @param {string} cancelText - Text for cancel button (default: 'Cancel')
 * @param {boolean} showCancel - Whether to show cancel button (default: true)
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
  // Don't render if not open
  if (!isOpen) return null;

  // Icon mapping based on modal type
  const iconMap = {
    approval: Shield,
    dlp: AlertTriangle,
    warning: AlertTriangle,
    info: Info,
    success: CheckCircle
  };

  // Color schemes based on Discord palette
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

  // Handle ESC key press
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  // ========================================
  // [INSERTION POINT: MILITARY LOGIC - PRE-RENDER]
  // Insert military-specific validation logic here:
  // - Classification level checks
  // - OPSEC validation
  // - Chain of command verification
  // - Compartmentalized information access control
  // ========================================

  return (
    <>
      {/* Animated Overlay */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        {/* Backdrop with blur effect - Discord style */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-200" />

        {/* Modal Container */}
        <div className="relative w-full max-w-md mx-4 animate-slideUp">
          {/* Modal Card - Discord dark theme */}
          <div className="bg-discord-dark-800 rounded-lg shadow-2xl overflow-hidden">
            
            {/* Header with Icon/Badge */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {/* Icon Badge */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full ${colors.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                  
                  {/* Title */}
                  <div className="flex-1 pt-1">
                    <h2 
                      id="modal-title"
                      className="text-xl font-semibold text-discord-text-primary mb-2"
                    >
                      {title}
                    </h2>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="flex-shrink-0 text-discord-text-muted hover:text-discord-text-primary transition-colors rounded-full p-1 hover:bg-discord-dark-700"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ========================================
                [INSERTION POINT: MILITARY LOGIC - HEADER]
                Insert military classification banners here:
                - TOP SECRET / SECRET / CONFIDENTIAL labels
                - Handling caveats (NOFORN, FOUO, etc.)
                - Special Access Program indicators
                ======================================== */}

            {/* Content */}
            <div className="px-6 pb-6">
              {description && (
                <p 
                  id="modal-description"
                  className="text-discord-text-secondary text-sm leading-relaxed mb-4"
                >
                  {description}
                </p>
              )}
              
              {/* Custom content */}
              {children && (
                <div className="mt-4">
                  {children}
                </div>
              )}

              {/* ========================================
                  [INSERTION POINT: MILITARY LOGIC - CONTENT]
                  Insert military approval workflow elements:
                  - Officer signature requirement
                  - Security clearance verification display
                  - Mission criticality indicators
                  - ROE (Rules of Engagement) compliance checks
                  ======================================== */}
            </div>

            {/* Footer with Discord-style Buttons */}
            <div className="bg-discord-dark-900 px-6 py-4 flex justify-end space-x-3">
              {showCancel && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-md text-sm font-medium text-discord-text-primary bg-transparent hover:bg-discord-dark-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-discord-dark-700 focus:ring-offset-discord-dark-900"
                  type="button"
                >
                  {cancelText}
                </button>
              )}
              
              <button
                onClick={onConfirm}
                className={`px-4 py-2 rounded-md text-sm font-medium ${colors.confirmBg} ${colors.confirmText} transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-discord-dark-900 shadow-sm`}
                type="button"
              >
                {confirmText}
              </button>

              {/* ========================================
                  [INSERTION POINT: MILITARY LOGIC - ACTIONS]
                  Insert military action buttons:
                  - Escalate to Command button
                  - Override with authorization code
                  - Emergency abort procedures
                  - Secure communication channel initiation
                  ======================================== */}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations (add to global CSS or Tailwind config) */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Modal;

/**
 * TAILWIND DISCORD PALETTE CONFIGURATION
 * 
 * Add to tailwind.config.js:
 * 
 * module.exports = {
 *   theme: {
 *     extend: {
 *       colors: {
 *         'discord-dark-900': '#1e1f22',
 *         'discord-dark-800': '#2b2d31',
 *         'discord-dark-700': '#313338',
 *         'discord-text-primary': '#f2f3f5',
 *         'discord-text-secondary': '#b5bac1',
 *         'discord-text-muted': '#80848e',
 *         'blurple-500': '#5865f2',
 *         'blurple-600': '#4752c4',
 *       },
 *     },
 *   },
 * }
 * 
 * ========================================
 * [INSERTION POINT: MILITARY LOGIC - USAGE EXAMPLES]
 * 
 * Example military-specific modal usage:
 * 
 * // DLP (Data Loss Prevention) Alert
 * <Modal
 *   isOpen={true}
 *   type="dlp"
 *   title="Data Loss Prevention Alert"
 *   description="Classified information detected in outgoing transmission. Requires authorization."
 *   onConfirm={handleDLPOverride}
 *   onClose={handleDLPCancel}
 *   confirmText="Authorize Transfer"
 * />
 * 
 * // Mission Approval
 * <Modal
 *   isOpen={true}
 *   type="approval"
 *   title="Mission Authorization Required"
 *   description="This operation requires command approval. Please verify authorization code."
 *   onConfirm={handleMissionApproval}
 *   onClose={handleMissionCancel}
 *   confirmText="Approve Mission"
 * />
 * 
 * // OPSEC Warning
 * <Modal
 *   isOpen={true}
 *   type="warning"
 *   title="OPSEC Violation Detected"
 *   description="The requested action may compromise operational security. Review and confirm."
 *   onConfirm={handleOPSECOverride}
 *   onClose={handleOPSECCancel}
 *   confirmText="Override Warning"
 * />
 * ========================================
 */
