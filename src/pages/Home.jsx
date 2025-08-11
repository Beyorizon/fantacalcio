import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import AppLayout from '../layouts/AppLayout';
import TopBar from '../ui/TopBar';
import Card from '../ui/Card';
import Button from '../ui/Button';
import BottomNav from '../ui/BottomNav';

export default function Home() {
  const [utenti, setUtenti] = useState([]);
  const navigate = useNavigate();

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
      <div className="max-w-[480px] mx-auto p-4 space-y-3">
        {utenti.map((utente) => (
          <Card key={utente.id} className="rounded-2xl shadow-soft hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{utente.nome}</div>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => navigate(`/rosa/${encodeURIComponent(utente.nome)}`)}
              >
                Vedi Rosa
              </Button>
            </div>
          </Card>
        ))}
        
        {utenti.length === 0 && (
          <Card className="p-8 text-center">
            <div className="text-gray-500 dark:text-gray-400 italic">
              Nessun utente trovato.
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
