import { motion } from 'framer-motion';
import Card from './Card';

export function ResponsiveTable({ columns, rows, className = '' }) {
  // Mobile: card per riga
  const MobileView = () => (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, delay: i * 0.05 }}
        >
          <Card className="hover:shadow-card transition-shadow duration-200">
            {columns.map((col) => (
              <div key={col.key} className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-700 last:border-b-0">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 capitalize">
                  {col.label}
                </span>
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {col.render ? col.render(row) : row[col.key] || '-'}
                </div>
              </div>
            ))}
          </Card>
        </motion.div>
      ))}
    </div>
  );

  // Desktop: tabella classica con header sticky
  const DesktopView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="sticky top-0 bg-white dark:bg-zinc-900 z-10">
          <tr>
            {columns.map(col => (
              <th 
                key={col.key} 
                className="px-3 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-700"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
          {rows.map((row, i) => (
            <motion.tr 
              key={i} 
              className="hover:bg-brand-50/40 dark:hover:bg-zinc-800/50 transition-colors duration-150"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: i * 0.02 }}
            >
              {columns.map(col => (
                <td key={col.key} className="px-3 py-3 text-sm text-zinc-900 dark:text-zinc-100">
                  {col.render ? col.render(row) : row[col.key] || '-'}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className={`w-full ${className}`}>
      {/* Mobile view */}
      <div className="md:hidden">
        <MobileView />
      </div>
      
      {/* Desktop view */}
      <div className="hidden md:block">
        <DesktopView />
      </div>
    </div>
  );
}

export default ResponsiveTable;
