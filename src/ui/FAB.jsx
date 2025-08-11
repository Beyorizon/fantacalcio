import { motion } from 'framer-motion';

const FAB = ({ 
  onClick, 
  disabled = false, 
  loading = false,
  children, 
  className = '',
  ...props 
}) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      className={`fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-brand-600 text-white shadow-card hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      whileHover={{ scale: disabled || loading ? 1 : 1.05 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {loading ? (
        <motion.div
          className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      ) : (
        children
      )}
    </motion.button>
  );
};

export default FAB;
