import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import Card from '../ui/Card';
import Button from '../ui/Button';

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
    <AppLayout title="Lista Utenti">
      <div className="space-y-4">
        {utenti.map((utente) => (
          <Card key={utente.id} className="p-4 hover:shadow-card transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {utente.nome}
              </h3>
              <Link to={`/rosa/${utente.nome}`}>
                <Button variant="primary" size="sm">
                  Vedi Rosa
                </Button>
              </Link>
            </div>
          </Card>
        ))}
        
        {utenti.length === 0 && (
          <Card className="p-8 text-center">
            <div className="text-zinc-500 dark:text-zinc-400 italic">
              Nessun utente trovato.
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
