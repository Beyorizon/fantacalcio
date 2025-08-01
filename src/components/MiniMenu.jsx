import { Link, useLocation } from 'react-router-dom';

const menuStyle = {
  display: 'flex',
  gap: '1.5rem',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '0.75rem 0',
  background: '#f8f9fa',
  borderBottom: '1px solid #e0e0e0',
  marginBottom: '2rem',
};

const linkStyle = {
  textDecoration: 'none',
  color: '#333',
  fontWeight: 500,
  fontSize: '1rem',
  padding: '0.25rem 0.75rem',
  borderRadius: '4px',
  transition: 'background 0.2s, color 0.2s',
};

const activeStyle = {
  background: '#007bff',
  color: 'white',
};

export default function MiniMenu() {
  const location = useLocation();
  return (
    <nav style={menuStyle}>
      <Link
        to="/"
        style={{
          ...linkStyle,
          ...(location.pathname === '/' ? activeStyle : {}),
        }}
      >
        Home
      </Link>
      <Link
        to="/aggiornamenti"
        style={{
          ...linkStyle,
          ...(location.pathname.startsWith('/aggiornamenti') ? activeStyle : {}),
        }}
      >
        Aggiornamenti
      </Link>
    </nav>
  );
} 