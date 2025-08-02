import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import Home from './pages/Home.jsx';
import Rosa from './pages/Rosa.jsx';
import Aggiornamenti from './pages/Aggiornamenti.jsx';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="rosa/:utenteId" element={<Rosa />} />
          <Route path="aggiornamenti" element={<Aggiornamenti />} />
        </Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
