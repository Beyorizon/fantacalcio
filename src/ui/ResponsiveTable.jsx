import { motion } from 'framer-motion';

export function ResponsiveTable({ columns, rows, className = '' }) {
  return (
    <div className={`w-full overflow-x-auto pb-20 ${className}`}>
      <table className="min-w-[900px] table-fixed text-sm md:text-base">
        <thead className="sticky top-0 bg-white dark:bg-gray-950 z-10">
          <tr>
            {columns.map(col => (
              <th 
                key={col.key} 
                className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {rows.map((row, i) => (
            <motion.tr 
              key={i} 
              className="hover:bg-brand-50/40 dark:hover:bg-gray-800/50 transition-colors duration-150"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: i * 0.02 }}
            >
              {columns.map(col => (
                <td key={col.key} className="px-3 py-3 text-sm text-gray-900 dark:text-gray-100">
                  {col.render ? col.render(row) : row[col.key] || '-'}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ResponsiveTable;
