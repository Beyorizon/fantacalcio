import { motion } from 'framer-motion';

const Select = ({ 
  options = [],
  value = '',
  onChange,
  placeholder = 'Seleziona...',
  className = '',
  disabled = false,
  error = false,
  ...props 
}) => {
  const baseClasses = 'w-full rounded-xl border-2 px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-400/20 appearance-none bg-no-repeat bg-right pr-10';
  const stateClasses = error 
    ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20' 
    : 'border-zinc-200 focus:border-brand-400 focus:ring-brand-400/20';
  const themeClasses = 'bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  const classes = `${baseClasses} ${stateClasses} ${themeClasses} ${disabledClasses} ${className}`;

  return (
    <div className="relative">
      <motion.select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={classes}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 0.75rem center',
          backgroundSize: '1.5em 1.5em'
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </motion.select>
    </div>
  );
};

export default Select;
