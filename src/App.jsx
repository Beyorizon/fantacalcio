import { Outlet, useLocation } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import { useRefreshAction } from './hooks/useRefreshAction';

export default function App() {
  const location = useLocation();
  const { refreshAction } = useRefreshAction();
  
  // Mappa dei titoli per le diverse pagine
  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/':
        return 'Fantacalcio';
      case '/news':
        return 'News';
      case '/regolamento':
        return 'Regolamento';
      case '/scambi':
        return 'Scambi';
      case '/login':
        return 'Login';
      default:
        return 'Fantacalcio';
    }
  };

  // Gestione speciale per la pagina Rosa
  const getRosaTitle = () => {
    if (location.pathname.startsWith('/rosa/')) {
      const utenteId = location.pathname.split('/')[2];
      return `Rosa di ${utenteId}`;
    }
    return null;
  };

  const title = getRosaTitle() || getPageTitle(location.pathname);

  return (
    <div className="App">
      <AppLayout title={title} refreshAction={refreshAction}>
        <Outlet />
      </AppLayout>
    </div>
  );
}
