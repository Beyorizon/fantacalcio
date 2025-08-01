import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';
import MiniMenu from '../components/MiniMenu';

export default function Home() {
  const [utenti, setUtenti] = useState([]);

  useEffect(() => {
    const fetchUtenti = async () => {
      const { data, error } = await supabase
        .from('utenti')
        .select('*')
        .order('nome');

      if (error) {
        console.error('Errore nel recupero degli utenti:', error);
      } else {
        setUtenti(data || []);
      }
    };

    fetchUtenti();
  }, []);

  return (
    <>
      <MiniMenu />
      <div style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Lista Utenti</h2>
        <div style={{ 
          display: 'grid', 
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
        }}>
          {utenti.map((utente) => (
            <div 
              key={utente.id} 
              style={{
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
                {utente.nome}
              </h3>
              <Link
                to={`/rosa/${utente.nome}`}
                style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontSize: '0.9rem'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
              >
                Vedi Rosa
              </Link>
            </div>
          ))}
        </div>
        
        {utenti.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem', 
            color: '#666',
            fontStyle: 'italic'
          }}>
            Nessun utente trovato.
          </div>
        )}
      </div>
    </>
  );
}
