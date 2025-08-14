import { useState, useEffect } from 'react';
import Card from '../ui/Card';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import Button from '../ui/Button';
import Toast from '../ui/Toast';

export default function Aggiornamenti() {
  const [aggiornamenti, setAggiornamenti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchAggiornamenti = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('aggiornamenti')
          .select('*')
          .order('data', { ascending: false });

        if (error) throw error;
        setAggiornamenti(data || []);
      } catch (error) {
        console.error('Errore nel caricamento degli aggiornamenti:', error);
        setToast({ show: true, message: 'Errore nel caricamento degli aggiornamenti', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchAggiornamenti();
  }, []);

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('aggiornamenti')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setAggiornamenti(prev => prev.filter(item => item.id !== id));
      setToast({ show: true, message: 'Aggiornamento eliminato con successo', type: 'success' });
    } catch (error) {
      console.error('Errore nell\'eliminazione dell\'aggiornamento:', error);
      setToast({ show: true, message: 'Errore nell\'eliminazione dell\'aggiornamento', type: 'error' });
    }
  };

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ show: false, message: '', type: 'info' })}
      />
      
      {isAdmin && (
        <div className="mb-4 flex justify-end">
          <Button
            onClick={() => alert('Funzionalità di creazione da implementare')}
            className="bg-brand-600 hover:bg-brand-700 text-white"
          >
            Nuovo Aggiornamento
          </Button>
        </div>
      )}

      {loading ? (
        <Card className="p-6">
          <p className="text-zinc-600 dark:text-zinc-400">Caricamento in corso...</p>
        </Card>
      ) : aggiornamenti.length === 0 ? (
        <Card className="p-6">
          <p className="text-zinc-600 dark:text-zinc-400">Nessun aggiornamento disponibile.</p>
        </Card>
      ) : (
        aggiornamenti.map(aggiornamento => (
          <Card key={aggiornamento.id} className="p-6 mb-4">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                {aggiornamento.titolo}
              </h2>
              {isAdmin && (
                <div className="flex space-x-2">
                  <Button
                    onClick={() => alert(`Modifica aggiornamento ${aggiornamento.id}`)}
                    className="bg-amber-500 hover:bg-amber-600 text-white text-sm px-2 py-1"
                  >
                    Modifica
                  </Button>
                  <Button
                    onClick={() => handleDelete(aggiornamento.id)}
                    className="bg-red-500 hover:bg-red-600 text-white text-sm px-2 py-1"
                  >
                    Elimina
                  </Button>
                </div>
              )}
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
              {new Date(aggiornamento.data).toLocaleDateString('it-IT')}
            </p>
            <div className="text-zinc-600 dark:text-zinc-400">
              {aggiornamento.contenuto}
            </div>
          </Card>
        ))
      )}
    </>
  );
}
  