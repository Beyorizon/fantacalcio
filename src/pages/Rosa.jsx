import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useParams } from 'react-router-dom';
import Toast from '../ui/Toast';
import { useRefreshAction } from '../hooks/useRefreshAction';
import { useAuth } from '../context/AuthContext';

// Predefined role options
const ruoloOptions = [
  "Por", "DC", "DD E", "DS E", "DC DS E", "DD DS E", "DC DS", "DC DD",
  "B DS E", "B DD E", "E", "EW", "EM", "EC",
  "M", "MC", "C", "CT", "CW", "CWT",
  "T", "W", "WT", "WA", "TA", "A", "Pc"
];

const u23Options = ["", "Si", "No"];

// EditableCell component for inline editing
const EditableCell = ({ value, field, giocatoreId, onSave, type = 'text', isAdmin = false }) => {
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

  // Se non è admin, mostra solo il valore senza possibilità di modifica
  if (!isAdmin) {
    return (
      <span className="inline-block w-full px-2 py-1 min-h-[32px] flex items-center">
        {value || '-'}
      </span>
    );
  }

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
        className="w-full rounded-lg border px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
        aria-label={`${field} riga ${giocatoreId}`}
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className="cursor-pointer inline-block w-full px-2 py-1 rounded-lg border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 min-h-[32px] flex items-center"
    >
      {value || '-'}
    </span>
  );
};

export default function Rosa() {
  const { utenteId } = useParams();
  const [rosa, setRosa] = useState([]);
  const [nomeUtente, setNomeUtente] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [updatingTotale, setUpdatingTotale] = useState(false);
  const { setRefreshActionForPage, clearRefreshAction } = useRefreshAction();
  const { isAdmin } = useAuth();

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

  // Imposta l'azione di refresh quando il componente si monta (solo per admin)
  useEffect(() => {
    if (isAdmin) {
      setRefreshActionForPage({
        onClick: handleAggiornaTotale,
        loading: updatingTotale
      });
    } else {
      clearRefreshAction();
    }

    // Pulisce l'azione quando il componente si smonta
    return () => {
      clearRefreshAction();
    };
  }, [updatingTotale, setRefreshActionForPage, clearRefreshAction, isAdmin]);

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
      setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
    }
  };

  const renderSelectCell = (giocatore, campo, options) => {
    // Se non è admin, mostra solo il valore senza possibilità di modifica
    if (!isAdmin) {
      return (
        <span className="inline-block w-full px-2 py-1 min-h-[32px] flex items-center">
          {giocatore[campo] || '-'}
        </span>
      );
    }
    
    // Se è admin, mostra il select per la modifica
    return (
      <select
        value={giocatore[campo] || ""}
        onChange={(e) => handleUpdate(giocatore.id, campo, e.target.value)}
        className="w-full rounded-lg border px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 cursor-pointer"
        aria-label={`${campo} riga ${giocatore.id}`}
      >
        {options.map(opt => (
          <option key={opt} value={opt}>
            {opt === "" ? "-" : opt}
          </option>
        ))}
      </select>
    );
  };

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

  return (
    <>
      {/* Toast notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ show: false, message: '', type: 'info' })}
      />

      {/* Main roster table */}
      <div className="w-full overflow-x-auto pb-24">
        <table className="min-w-[900px] table-fixed text-sm md:text-base">
          <thead className="sticky top-0 bg-white dark:bg-gray-950 z-10">
            <tr>
              <th className="w-16 px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                NUMERO
              </th>
              <th className="w-48 px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                NOME
              </th>
              <th className="w-24 px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                RUOLO
              </th>
              <th className="w-20 px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                U23
              </th>
              <th className="w-20 px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                SC
              </th>
              <th className="w-20 px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                CL
              </th>
              <th className="w-20 px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                FM
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {giocatoriPrincipali.map((giocatore, i) => (
              <tr key={giocatore.id} className="hover:bg-brand-50/40 dark:hover:bg-gray-800/50 transition-colors duration-150">
                <td className="px-3 py-3 text-center font-bold text-gray-900 dark:text-gray-100">
                  {giocatore.numero || '-'}
                </td>
                <td className="px-3 py-3 text-gray-900 dark:text-gray-100">
                  <EditableCell
                    value={giocatore.nome}
                    field="nome"
                    giocatoreId={giocatore.id}
                    onSave={handleUpdate}
                    type="text"
                    isAdmin={isAdmin}
                  />
                </td>
                <td className="px-3 py-3">
                  {renderSelectCell(giocatore, 'ruolo', ruoloOptions)}
                </td>
                <td className="px-3 py-3">
                  {renderSelectCell(giocatore, 'u23', u23Options)}
                </td>
                <td className="px-3 py-3">
                  <EditableCell
                    value={giocatore.sc}
                    field="sc"
                    giocatoreId={giocatore.id}
                    onSave={handleUpdate}
                    type="text"
                    isAdmin={isAdmin}
                  />
                </td>
                <td className="px-3 py-3">
                  <EditableCell
                    value={giocatore.cl}
                    field="cl"
                    giocatoreId={giocatore.id}
                    onSave={handleUpdate}
                    type="number"
                    isAdmin={isAdmin}
                  />
                </td>
                <td className="px-3 py-3">
                  <EditableCell
                    value={giocatore.fm}
                    field="fm"
                    giocatoreId={giocatore.id}
                    onSave={handleUpdate}
                    type="number"
                    isAdmin={isAdmin}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Extra players section */}
      {giocatoriExtra.length > 0 && (
        <div className="mt-8 pb-24">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
            🎯 Giocatori Extra (29-30)
          </h3>
          <div className="w-full overflow-x-auto">
            <table className="min-w-[900px] table-fixed text-sm md:text-base">
              <thead className="sticky top-0 bg-white dark:bg-gray-950 z-10">
                <tr>
                  <th className="w-16 px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                    NUMERO
                  </th>
                  <th className="w-48 px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                    NOME
                  </th>
                  <th className="w-24 px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                    RUOLO
                  </th>
                  <th className="w-20 px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                    U23
                  </th>
                  <th className="w-20 px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                    SC
                  </th>
                  <th className="w-20 px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                    CL
                  </th>
                  <th className="w-20 px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                    FM
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {giocatoriExtra.map((giocatore) => (
                  <tr key={giocatore.id} className="hover:bg-brand-50/40 dark:hover:bg-gray-800/50 transition-colors duration-150">
                    <td className="px-3 py-3 text-center font-bold text-gray-900 dark:text-gray-100">
                      {giocatore.numero || '-'}
                    </td>
                    <td className="px-3 py-3 text-gray-900 dark:text-gray-100">
                      <EditableCell
                        value={giocatore.nome}
                        field="nome"
                        giocatoreId={giocatore.id}
                        onSave={handleUpdate}
                        type="text"
                        isAdmin={isAdmin}
                      />
                    </td>
                    <td className="px-3 py-3">
                      {renderSelectCell(giocatore, 'ruolo', ruoloOptions)}
                    </td>
                    <td className="px-3 py-3">
                      {renderSelectCell(giocatore, 'u23', u23Options)}
                    </td>
                    <td className="px-3 py-3">
                      <EditableCell
                        value={giocatore.sc}
                        field="sc"
                        giocatoreId={giocatore.id}
                        onSave={handleUpdate}
                        type="text"
                        isAdmin={isAdmin}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <EditableCell
                        value={giocatore.cl}
                        field="cl"
                        giocatoreId={giocatore.id}
                        onSave={handleUpdate}
                        type="number"
                        isAdmin={isAdmin}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <EditableCell
                        value={giocatore.fm}
                        field="fm"
                        giocatoreId={giocatore.id}
                        onSave={handleUpdate}
                        type="number"
                        isAdmin={isAdmin}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
