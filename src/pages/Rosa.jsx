import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useParams } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import Button from '../ui/Button';
import Card from '../ui/Card';
import ResponsiveTable from '../ui/ResponsiveTable';
import FAB from '../ui/FAB';
import Toast from '../ui/Toast';

// Predefined role options
const ruoloOptions = [
  "Por", "DC", "DD E", "DS E", "DC DS E", "DD DS E", "DC DS", "DC DD",
  "B DS E", "B DD E", "E", "EW", "EM", "EC",
  "M", "MC", "C", "CT", "CW", "CWT",
  "T", "W", "WT", "WA", "TA", "A", "Pc"
];

const u23Options = ["", "Si", "No"];

// EditableCell component for inline editing
const EditableCell = ({ value, field, giocatoreId, onSave, type = 'text' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');

  const handleSave = async () => {
    let finalValue = editValue.trim();
    
    // Convert empty string to null for number fields
    if (type === 'number' && finalValue === '') {
      finalValue = null;
    } else if (type === 'number') {
      finalValue = Number(finalValue);
      if (isNaN(finalValue)) {
        finalValue = null;
      }
    }

    await onSave(giocatoreId, field, finalValue);
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value || '');
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  if (isEditing) {
    return (
      <input
        type={type === 'number' ? 'number' : 'text'}
        step={type === 'number' ? '0.01' : undefined}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyPress={handleKeyPress}
        onBlur={handleBlur}
        autoFocus
        className="w-full px-3 py-2 rounded-xl border-2 border-brand-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-400/20 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className="cursor-pointer inline-block w-full px-3 py-2 rounded-xl border-2 border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-200 min-h-[40px] flex items-center"
    >
      {value || '-'}
    </span>
  );
};

export default function Rosa() {
  const { utenteId } = useParams();
  const [rosa, setRosa] = useState([]);
  const [nomeUtente, setNomeUtente] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [updatingTotale, setUpdatingTotale] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  useEffect(() => {
    const fetchDati = async () => {
      const { data: giocatori } = await supabase
        .from('giocatori')
        .select('*')
        .eq('utente', utenteId);

      if (giocatori) setRosa(giocatori);

      const { data: utente } = await supabase
        .from('utenti')
        .select('nome')
        .eq('nome', utenteId)
        .single();

      if (utente) setNomeUtente(utente.nome);
    };

    fetchDati();
  }, [utenteId]);

  // Ordinamento giocatori
  const rosaOrdinata = [...rosa].sort((a, b) => {
    const ordine = ["P1", "P2", ...Array.from({ length: 28 }, (_, i) => String(i + 1)), "X"];
    const indexA = ordine.indexOf(a.numero);
    const indexB = ordine.indexOf(b.numero);
    return indexA - indexB;
  });

  const giocatoriPrincipali = rosaOrdinata.filter(g =>
    ["P1", "P2", ...Array.from({ length: 28 }, (_, i) => String(i + 1)), "X"].includes(g.numero)
  );

  const giocatoriExtra = rosaOrdinata.filter(g => ["29", "30"].includes(g.numero));

  // Aggiornamento campi generico
  const handleUpdate = async (giocatoreId, campo, valore) => {
    const { error } = await supabase
      .from('giocatori')
      .update({ [campo]: valore })
      .eq('id', giocatoreId);

    if (!error) {
      setRosa(prev =>
        prev.map(g => (g.id === giocatoreId ? { ...g, [campo]: valore } : g))
      );
      setToast({ show: true, message: 'Salvato!', type: 'success' });
      setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 2000);
    } else {
      setToast({ show: true, message: 'Errore nel salvataggio', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 2000);
    }
  };

  const renderSelectCell = (giocatore, campo, options) => (
    <select
      value={giocatore[campo] || ""}
      onChange={(e) => handleUpdate(giocatore.id, campo, e.target.value)}
      className="w-full px-3 py-2 rounded-xl border-2 border-zinc-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 cursor-pointer"
    >
      {options.map(opt => (
        <option key={opt} value={opt}>
          {opt === "" ? "-" : opt}
        </option>
      ))}
    </select>
  );

  // Aggiorna totale function
  const handleAggiornaTotale = async () => {
    setUpdatingTotale(true);
    try {
      // 1° tentativo: parametro "nome_utente"
      let { error } = await supabase.rpc('aggiorna_totale_utente', {
        nome_utente: nomeUtente, // <- variabile già usata per filtrare la rosa
      });

      // Se l'RPC fallisce per parametro errato, riprova con "p_nome_utente"
      if (error) {
        const retry = await supabase.rpc('aggiorna_totale_utente', {
          p_nome_utente: nomeUtente,
        });
        if (retry.error) throw retry.error;
      }

      // Ricarica i dati della tabella
      const { data: giocatori } = await supabase
        .from('giocatori')
        .select('*')
        .eq('utente', utenteId);
      
      if (giocatori) setRosa(giocatori);

      setToast({ show: true, message: 'Totale aggiornato!', type: 'success' });
      setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
    } catch (err) {
      console.error('Errore aggiorna_totale_utente:', err);
      setToast({ show: true, message: 'Errore nell\'aggiornamento del totale', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
    } finally {
      setUpdatingTotale(false);
    }
  };

  // Prepare table data for ResponsiveTable
  const tableColumns = [
    { key: 'numero', label: 'Numero' },
    { key: 'nome', label: 'Nome' },
    { key: 'ruolo', label: 'Ruolo' },
    { key: 'u23', label: 'U23' },
    { key: 'sc', label: 'SC' },
    { key: 'cl', label: 'CL' },
    { key: 'fm', label: 'FM' }
  ];

  const tableRows = giocatoriPrincipali.map(giocatore => ({
    ...giocatore,
    numero: giocatore.numero || '-',
    nome: (
      <EditableCell
        value={giocatore.nome}
        field="nome"
        giocatoreId={giocatore.id}
        onSave={handleUpdate}
        type="text"
      />
    ),
    ruolo: renderSelectCell(giocatore, 'ruolo', ruoloOptions),
    u23: renderSelectCell(giocatore, 'u23', u23Options),
    sc: (
      <EditableCell
        value={giocatore.sc}
        field="sc"
        giocatoreId={giocatore.id}
        onSave={handleUpdate}
        type="text"
      />
    ),
    cl: (
      <EditableCell
        value={giocatore.cl}
        field="cl"
        giocatoreId={giocatore.id}
        onSave={handleUpdate}
        type="number"
      />
    ),
    fm: (
      <EditableCell
        value={giocatore.fm}
        field="fm"
        giocatoreId={giocatore.id}
        onSave={handleUpdate}
        type="number"
      />
    )
  }));

  return (
    <AppLayout title={`Rosa di ${nomeUtente}`}>
      {/* Toast notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ show: false, message: '', type: 'info' })}
      />

      {/* Main roster table */}
      <div className="space-y-4">
        <ResponsiveTable columns={tableColumns} rows={tableRows} />
      </div>

      {/* Extra players section */}
      {giocatoriExtra.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 text-center">
            🎯 Giocatori Extra (29-30)
          </h3>
          <div className="space-y-3">
            {giocatoriExtra.map((giocatore) => (
              <Card key={giocatore.id} className="p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-500 dark:text-zinc-400">Numero:</span>
                      <span className="font-medium">{giocatore.numero || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 dark:text-zinc-400">Nome:</span>
                      <div className="flex-1 ml-2">
                        <EditableCell
                          value={giocatore.nome}
                          field="nome"
                          giocatoreId={giocatore.id}
                          onSave={handleUpdate}
                          type="text"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 dark:text-zinc-400">Ruolo:</span>
                      <div className="flex-1 ml-2">
                        {renderSelectCell(giocatore, 'ruolo', ruoloOptions)}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-500 dark:text-zinc-400">U23:</span>
                      <div className="flex-1 ml-2">
                        {renderSelectCell(giocatore, 'u23', u23Options)}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 dark:text-zinc-400">SC:</span>
                      <div className="flex-1 ml-2">
                        <EditableCell
                          value={giocatore.sc}
                          field="sc"
                          giocatoreId={giocatore.id}
                          onSave={handleUpdate}
                          type="text"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 dark:text-zinc-400">CL:</span>
                      <div className="flex-1 ml-2">
                        <EditableCell
                          value={giocatore.cl}
                          field="cl"
                          giocatoreId={giocatore.id}
                          onSave={handleUpdate}
                          type="number"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 dark:text-zinc-400">FM:</span>
                      <div className="flex-1 ml-2">
                        <EditableCell
                          value={giocatore.fm}
                          field="fm"
                          giocatoreId={giocatore.id}
                          onSave={handleUpdate}
                          type="number"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <FAB
        onClick={handleAggiornaTotale}
        loading={updatingTotale}
        disabled={updatingTotale}
        title="Aggiorna Totale"
      >
        🔄
      </FAB>
    </AppLayout>
  );
}
