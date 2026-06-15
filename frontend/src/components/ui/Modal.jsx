import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XIcon } from 'lucide-react'

export default function Modal({ open, onClose, title, children }) {
  // Close on Escape key press
  useEffect(() => {
    if (!open) return
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/65 backdrop-blur-[3px]"
          />

          {/* Modal Panel container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0.1 }}
            className="relative bg-darkSecondary border border-darkBorder rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto z-10 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-darkBorder bg-darkCard/40 shrink-0">
              <h2 className="text-xs font-black text-white uppercase tracking-widest">{title}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-darkCard transition-colors focus:outline-none focus:ring-1 focus:ring-brand-500"
                aria-label="Close modal"
              >
                <XIcon size={16} />
              </button>
            </div>

            {/* Content Body */}
            <div className="px-6 py-5 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
