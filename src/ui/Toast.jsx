import { motion, AnimatePresence } from 'framer-motion';

const Toast = ({ message, type = 'info', isVisible, onClose, duration = 3000 }) => {
  const variants = {
    info: 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-700',
    success: 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-700',
    warning: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
    error: 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300 border-red-200 dark:border-red-700'
  };

  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-sm w-full mx-4 px-4 py-3 rounded-2xl border shadow-soft ${variants[type]}`}
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">{icons[type]}</span>
            <p className="text-sm font-medium flex-1">{message}</p>
            <button
              onClick={onClose}
              className="text-current opacity-70 hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
