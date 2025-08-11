import { motion } from 'framer-motion';

const Input = ({ 
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  className = '',
  disabled = false,
  error = false,
  ...props 
}) => {
  const baseClasses = 'w-full rounded-xl border-2 px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-400/20';
  const stateClasses = error 
    ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20' 
    : 'border-zinc-200 focus:border-brand-400 focus:ring-brand-400/20';
  const themeClasses = 'bg-white text-zinc-900 placeholder-zinc-500 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700 dark:placeholder-zinc-400';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  const classes = `${baseClasses} ${stateClasses} ${themeClasses} ${disabledClasses} ${className}`;

  return (
    <motion.input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={classes}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      {...props}
    />
  );
};

export default Input;
