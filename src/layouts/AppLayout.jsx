import TopBar from '../ui/TopBar';
import BottomNav from '../ui/BottomNav';

/**
 * Layout principale dell'applicazione.
 * Fornisce una struttura coerente con TopBar e BottomNav per tutte le pagine.
 * 
 * @param {Object} props - Proprietà del componente
 * @param {string} props.title - Titolo da mostrare nella TopBar
 * @param {React.ReactNode} props.right - Elementi aggiuntivi da mostrare a destra nella TopBar
 * @param {Object} props.refreshAction - Configurazione per l'azione di refresh nella TopBar
 * @param {React.ReactNode} props.children - Contenuto principale della pagina
 */

const AppLayout = ({ title, right, refreshAction, children }) => {
  return (
    <div className="app-container min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Barra superiore con titolo e azioni */}
      <TopBar title={title} right={right} refreshAction={refreshAction} />
      
      {/* Contenuto principale con padding per safe areas */}
      <main className="pt-[env(safe-area-inset-top)] pb-[calc(env(safe-area-inset-bottom)+64px)]">
        {children}
      </main>
      
      {/* Barra di navigazione inferiore */}
      <BottomNav />
    </div>
  );
};

export default AppLayout;
