import { useState, useEffect } from 'react';
import AppLayout from '../layouts/AppLayout';
import Card from '../ui/Card';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import Button from '../ui/Button';
import Toast from '../ui/Toast';

export default function Scambi() {
  const [scambi, setScambi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchScambi = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('scambi')
          .select('*, utente_cedente(*), utente_ricevente(*)')
          .order('data', { ascending: false });

        if (error) throw error;
        setScambi(data || []);
      } catch (error) {
        console.error('Errore nel caricamento degli scambi:', error);
        setToast({ show: true, message: 'Errore nel caricamento degli scambi', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchScambi();
  }, []);

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('scambi')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setScambi(prev => prev.filter(item => item.id !== id));
      setToast({ show: true, message: 'Scambio eliminato con successo', type: 'success' });
    } catch (error) {
      console.error('Errore nell\'eliminazione dello scambio:', error);
      setToast({ show: true, message: 'Errore nell\'eliminazione dello scambio', type: 'error' });
    }
  };

  return (
    <AppLayout title="Scambi">
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
            Nuovo Scambio
          </Button>
        </div>
      )}

      {loading ? (
        <Card className="p-6">
          <p className="text-gray-600 dark:text-gray-400">Caricamento in corso...</p>
        </Card>
      ) : scambi.length === 0 ? (
        <Card className="p-6">
          <p className="text-gray-600 dark:text-gray-400">Nessuno scambio disponibile.</p>
        </Card>
      ) : (
        scambi.map(scambio => (
          <Card key={scambio.id} className="p-6 mb-4">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Scambio: {scambio.utente_cedente?.nome} ↔ {scambio.utente_ricevente?.nome}
              </h2>
              {isAdmin && (
                <div className="flex space-x-2">
                  <Button
                    onClick={() => alert(`Modifica scambio ${scambio.id}`)}
                    className="bg-amber-500 hover:bg-amber-600 text-white text-sm px-2 py-1"
                  >
                    Modifica
                  </Button>
                  <Button
                    onClick={() => handleDelete(scambio.id)}
                    className="bg-red-500 hover:bg-red-600 text-white text-sm px-2 py-1"
                  >
                    Elimina
                  </Button>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              {new Date(scambio.data).toLocaleDateString('it-IT')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                  {scambio.utente_cedente?.nome} cede:
                </h3>
                <div className="text-gray-600 dark:text-gray-400">
                  {scambio.giocatori_ceduti}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                  {scambio.utente_ricevente?.nome} cede:
                </h3>
                <div className="text-gray-600 dark:text-gray-400">
                  {scambio.giocatori_ricevuti}
                </div>
              </div>
            </div>
            {scambio.note && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Note:</h3>
                <div className="text-gray-600 dark:text-gray-400">{scambio.note}</div>
              </div>
            )}
          </Card>
        ))
      )}
    </AppLayout>
  );
}
