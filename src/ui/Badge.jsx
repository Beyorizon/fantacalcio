import { motion } from 'framer-motion';

const Badge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium';
  
  const variants = {
    default: 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300',
    success: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300',
    warning: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300',
    danger: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300',
    info: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
  };
  
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base'
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <motion.span
      className={classes}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.span>
  );
};

export default Badge;
