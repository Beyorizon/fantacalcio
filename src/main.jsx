import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import Home from './pages/Home.jsx';
import Rosa from './pages/Rosa.jsx';
import Aggiornamenti from './pages/Aggiornamenti.jsx';
import News from './pages/News.jsx';
import Regolamento from './pages/Regolamento.jsx';
import Scambi from './pages/Scambi.jsx';
import Login from './pages/Login.jsx';
import { AuthProvider } from './context/AuthContext';
import { RefreshActionProvider } from './hooks/useRefreshAction';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <RefreshActionProvider>
          <Routes>
            <Route path="/" element={<App />}>
              <Route index element={<Home />} />
              {/* Rotte protette - richiedono autenticazione */}
              <Route path="rosa/:utenteId" element={<Rosa />} />
              {/* Rotte pubbliche */}
              <Route path="aggiornamenti" element={<Aggiornamenti />} />
              <Route path="news" element={<News />} />
              <Route path="regolamento" element={<Regolamento />} />
              <Route path="scambi" element={<Scambi />} />
              <Route path="login" element={<Login />} />
              
              {/* Rotte admin - richiedono autenticazione e privilegi admin */}
              <Route path="admin/news" element={
                <AdminRoute><Aggiornamenti /></AdminRoute>
              } />
              <Route path="admin/regolamento" element={
                <AdminRoute><Regolamento /></AdminRoute>
              } />
              <Route path="admin/scambi" element={
                <AdminRoute><Scambi /></AdminRoute>
              } />
            </Route>
          </Routes>
        </RefreshActionProvider>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
);
