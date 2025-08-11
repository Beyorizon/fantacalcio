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
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="rosa/:utenteId" element={<Rosa />} />
          <Route path="aggiornamenti" element={<Aggiornamenti />} />
          <Route path="news" element={<News />} />
          <Route path="regolamento" element={<Regolamento />} />
          <Route path="scambi" element={<Scambi />} />
          <Route path="login" element={<Login />} />
        </Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
