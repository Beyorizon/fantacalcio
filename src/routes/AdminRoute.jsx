import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente per proteggere le rotte che richiedono privilegi di amministratore.
 * Reindirizza alla pagina di login se l'utente non è autenticato.
 * Reindirizza alla home se l'utente è autenticato ma non è admin.
 * 
 * @param {Object} props - Proprietà del componente
 * @param {React.ReactNode} props.children - Componente da renderizzare se l'utente è admin
 * @returns {React.ReactNode} Il componente children se l'utente è admin, altrimenti un reindirizzamento
 */

export default function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  
  // Durante il caricamento dello stato di autenticazione, non mostrare nulla
  if (loading) return null;
  
  // Se l'utente non è autenticato, reindirizza alla pagina di login
  if (!user) return <Navigate to="/login" replace />;
  
  // Se l'utente è autenticato ma non è admin, reindirizza alla home
  // Altrimenti, mostra il contenuto protetto
  return isAdmin ? children : <Navigate to="/" replace />;
}
