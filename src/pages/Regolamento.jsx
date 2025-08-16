import { useState, useEffect } from 'react';
import Card from '../ui/Card';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import Button from '../ui/Button';
import Toast from '../ui/Toast';

export default function Regolamento() {
  const [regolamenti, setRegolamenti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const { isAdmin } = useAuth();
  const [open, setOpen] = useState(false); // stato per apertura/chiusura
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    const fetchRegolamenti = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('regolamento')
          .select('*')
          .order('id', { ascending: true });

        if (error) throw error;
        setRegolamenti(data || []);
      } catch (error) {
        console.error('Errore nel caricamento del regolamento:', error);
        setToast({ show: true, message: 'Errore nel caricamento del regolamento', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchRegolamenti();
  }, []);

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('regolamento')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setRegolamenti(prev => prev.filter(item => item.id !== id));
      setToast({ show: true, message: 'Regola eliminata con successo', type: 'success' });
    } catch (error) {
      console.error('Errore nell\'eliminazione della regola:', error);
      setToast({ show: true, message: 'Errore nell\'eliminazione della regola', type: 'error' });
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
            Nuova Regola
          </Button>
        </div>
      )}

      {loading ? (
        <Card className="p-6">
          <p className="text-gray-600 dark:text-gray-400">Caricamento in corso...</p>
        </Card>
      ) : regolamenti.length === 0 ? (
        <Card className="p-6">
          <p className="text-gray-600 dark:text-gray-400">Nessuna regola disponibile.</p>
        </Card>
      ) : (
<Card className="p-6">
  {regolamenti.map(regola => (
    <div
      key={regola.id}
      className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0"
    >
      <div
        className="flex justify-between items-start cursor-pointer"
        onClick={() => setOpenId(openId === regola.id ? null : regola.id)}
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          {regola.titolo}
        </h3>
        <span className="text-gray-500">
          {openId === regola.id ? "▲" : "▼"}
        </span>
      </div>

      {openId === regola.id && (
        <div className="text-gray-600 dark:text-gray-400 whitespace-pre-line mt-2">
          {regola.contenuto}
        </div>
      )}
    </div>
  ))}
</Card>
      )}
    </>
  );
}
