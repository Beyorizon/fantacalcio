# Implementazione Autenticazione Fantacalcio Web

## Panoramica
È stata implementata un sistema completo di autenticazione utilizzando Supabase con gestione dello stato globale dell'utente e controllo dei privilegi di amministratore.

## Componenti Implementati

### 1. AuthContext (`src/context/AuthContext.jsx`)
- **Gestione stato**: `user`, `session`, `isAdmin`, `loading`
- **Funzioni**: `login()`, `logout()`, `refreshIsAdmin()`
- **Controllo admin**: Chiamata a `supabase.rpc('is_admin')` per verificare i privilegi

### 2. Rotte Protette
- **ProtectedRoute** (`src/routes/ProtectedRoute.jsx`): Richiede autenticazione
- **AdminRoute** (`src/routes/AdminRoute.jsx`): Richiede autenticazione + privilegi admin

### 3. Pagina Login (`src/pages/Login.jsx`)
- Form con email e password
- Validazione base e gestione errori
- Redirect automatico dopo login
- Design coerente con Tailwind CSS

### 4. UI Aggiornate
- **TopBar**: Mostra badge "Admin", pulsanti Login/Logout
- **BottomNav**: Dinamica Login/Logout in base allo stato autenticazione

### 5. Gestione Refresh Actions
- **RefreshActionContext**: Sistema per gestire azioni di refresh tra pagine e layout
- Integrazione con AppLayout per azioni specifiche per pagina

## Utilizzo

### Proteggere una Rotta
```jsx
import ProtectedRoute from '../routes/ProtectedRoute';
import AdminRoute from '../routes/AdminRoute';

// Rotte protette
<Route path="/rosa/:utenteId" element={
  <ProtectedRoute><Rosa /></ProtectedRoute>
} />

// Rotte admin
<Route path="/admin/news" element={
  <AdminRoute><Aggiornamenti /></AdminRoute>
} />
```

### Utilizzare l'Autenticazione nei Componenti
```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAdmin, login, logout } = useAuth();
  
  if (!user) return <div>Effettua il login</div>;
  
  return (
    <div>
      <p>Benvenuto {user.email}</p>
      {isAdmin && <p>Sei un amministratore</p>}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Gestire Azioni di Refresh
```jsx
import { useRefreshAction } from '../hooks/useRefreshAction';

function MyPage() {
  const { setRefreshActionForPage, clearRefreshAction } = useRefreshAction();
  
  useEffect(() => {
    setRefreshActionForPage({
      onClick: handleRefresh,
      loading: isLoading
    });
    
    return () => clearRefreshAction();
  }, [isLoading]);
}
```

## Configurazione Database

### Funzione RPC `is_admin`
```sql
-- Creare questa funzione in Supabase
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Logica per determinare se l'utente è admin
  -- Esempio: controllare una tabella ruoli o un campo specifico
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
END;
$$;
```

## Sicurezza

- **AuthContext**: Gestisce token e sessioni in modo sicuro
- **Rotte protette**: Prevengono accesso non autorizzato
- **Controllo admin**: Verifica server-side dei privilegi
- **Logout**: Pulisce correttamente lo stato e la sessione

## Note Tecniche

- Utilizza React Context per stato globale
- Integrazione con React Router v6
- Gestione asincrona delle chiamate Supabase
- Design responsive e coerente con il sistema esistente
- Supporto per tema chiaro/scuro
- Animazioni con Framer Motion

## Prossimi Passi

1. **Implementare registrazione utenti** (se necessario)
2. **Aggiungere gestione password** (reset, cambio)
3. **Implementare ruoli multipli** oltre a admin
4. **Aggiungere logging** delle azioni amministrative
5. **Implementare cache** per i dati utente
