import { useState, useEffect } from 'react';
import AppLayout from '../layouts/AppLayout';
import Card from '../ui/Card';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import Button from '../ui/Button';
import Toast from '../ui/Toast';

export default function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .order('data', { ascending: false });

        if (error) throw error;
        setNews(data || []);
      } catch (error) {
        console.error('Errore nel caricamento delle news:', error);
        setToast({ show: true, message: 'Errore nel caricamento delle news', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setNews(prev => prev.filter(item => item.id !== id));
      setToast({ show: true, message: 'News eliminata con successo', type: 'success' });
    } catch (error) {
      console.error('Errore nell\'eliminazione della news:', error);
      setToast({ show: true, message: 'Errore nell\'eliminazione della news', type: 'error' });
    }
  };

  return (
    <AppLayout title="News">
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
            Nuova News
          </Button>
        </div>
      )}

      {loading ? (
        <Card className="p-6">
          <p className="text-gray-600 dark:text-gray-400">Caricamento in corso...</p>
        </Card>
      ) : news.length === 0 ? (
        <Card className="p-6">
          <p className="text-gray-600 dark:text-gray-400">Nessuna news disponibile.</p>
        </Card>
      ) : (
        news.map(item => (
          <Card key={item.id} className="p-6 mb-4">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {item.titolo}
              </h2>
              {isAdmin && (
                <div className="flex space-x-2">
                  <Button
                    onClick={() => alert(`Modifica news ${item.id}`)}
                    className="bg-amber-500 hover:bg-amber-600 text-white text-sm px-2 py-1"
                  >
                    Modifica
                  </Button>
                  <Button
                    onClick={() => handleDelete(item.id)}
                    className="bg-red-500 hover:bg-red-600 text-white text-sm px-2 py-1"
                  >
                    Elimina
                  </Button>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              {new Date(item.data).toLocaleDateString('it-IT')}
            </p>
            <div className="text-gray-600 dark:text-gray-400">
              {item.contenuto}
            </div>
          </Card>
        ))
      )}
    </AppLayout>
  );
}
