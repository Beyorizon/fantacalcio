import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  padding = 'p-4',
  hover = false,
  ...props 
}) => {
  const baseClasses = 'm-5 mb-10 rounded-2xl bg-white shadow-soft dark:bg-gray-800';
  const hoverClasses = hover ? 'hover:shadow-md transition-shadow duration-200' : '';
  const classes = `${baseClasses} ${padding} ${hoverClasses} ${className}`;

  return (
    <motion.div
      className={classes}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
