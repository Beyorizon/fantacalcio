import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente per proteggere le rotte che richiedono autenticazione.
 * Reindirizza alla pagina di login se l'utente non è autenticato.
 * 
 * @param {Object} props - Proprietà del componente
 * @param {React.ReactNode} props.children - Componente da renderizzare se l'utente è autenticato
 * @returns {React.ReactNode} Il componente children se l'utente è autenticato, altrimenti un reindirizzamento
 */

export default function ProtectedRoute({ children, allowPublicAccess = false }) {
  const { user, loading } = useAuth();
  
  // Durante il caricamento dello stato di autenticazione, non mostrare nulla
  // In alternativa si potrebbe mostrare uno spinner di caricamento
  if (loading) return null;
  
  // Se l'utente è autenticato, mostra il contenuto protetto
  // Se allowPublicAccess è true, mostra il contenuto anche senza autenticazione
  // Altrimenti, reindirizza alla pagina di login
  return user || allowPublicAccess ? children : <Navigate to="/login" replace />;
}
