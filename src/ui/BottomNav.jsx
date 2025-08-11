import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/news', label: 'News', icon: '📰' },
  { path: '/regolamento', label: 'Regolamento', icon: '📖' },
  { path: '/scambi', label: 'Scambi', icon: '🤝' },
  { path: '/login', label: 'Login', icon: '🔐' }
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="app-container">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200"
              >
                <motion.div
                  className={`text-2xl mb-1 ${isActive ? 'scale-110' : 'scale-100'}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {item.icon}
                </motion.div>
                <span className={`text-xs font-medium ${
                  isActive 
                    ? 'text-brand-600 dark:text-brand-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    className="absolute -top-1 w-1 h-1 bg-brand-600 dark:bg-brand-400 rounded-full"
                    layoutId="activeIndicator"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
};

export default BottomNav;
