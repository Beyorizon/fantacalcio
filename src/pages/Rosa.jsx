import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useParams } from 'react-router-dom';
import MiniMenu from '../components/MiniMenu';

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
        style={{
          width: '100%',
          padding: '4px 8px',
          border: '1px solid #007bff',
          borderRadius: '4px',
          fontSize: '14px',
          boxSizing: 'border-box'
        }}
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      style={{
        cursor: 'pointer',
        display: 'inline-block',
        width: '100%',
        padding: '4px 8px',
        border: '1px solid transparent',
        borderRadius: '4px',
        minHeight: '20px',
        lineHeight: '20px'
      }}
      onMouseEnter={(e) => {
        e.target.style.border = '1px solid #e9ecef';
        e.target.style.backgroundColor = '#f8f9fa';
      }}
      onMouseLeave={(e) => {
        e.target.style.border = '1px solid transparent';
        e.target.style.backgroundColor = 'transparent';
      }}
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
      setFeedback({ id: giocatoreId, campo, message: 'Salvato', type: 'success' });
      setTimeout(() => setFeedback(null), 2000);
    } else {
      setFeedback({ id: giocatoreId, campo, message: 'Errore', type: 'error' });
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  const renderSelectCell = (giocatore, campo, options) => (
    <select
      value={giocatore[campo] || ""}
      onChange={(e) => handleUpdate(giocatore.id, campo, e.target.value)}
      style={{
        padding: '4px 8px',
        border: '1px solid #ced4da',
        borderRadius: '4px',
        fontSize: '14px',
        backgroundColor: 'white',
        cursor: 'pointer',
        minWidth: '60px'
      }}
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
    try {
      const { error } = await supabase.rpc('recalc_totale', { utente: nomeUtente });
      
      if (!error) {
        // Reload the data after recalculation
        const { data: giocatori } = await supabase
          .from('giocatori')
          .select('*')
          .eq('utente', utenteId);
        
        if (giocatori) setRosa(giocatori);
        
        setFeedback({ message: 'Totale aggiornato con successo!', type: 'success' });
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback({ message: 'Errore nell\'aggiornamento del totale', type: 'error' });
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err) {
      setFeedback({ message: 'Errore nella chiamata RPC', type: 'error' });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '100%', overflowX: 'auto' }}>
      <MiniMenu />
      <h2 style={{ marginBottom: '1.5rem' }}>Rosa di {nomeUtente}</h2>
      
      {/* Bottone Aggiorna Totale */}
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={handleAggiornaTotale}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          🔄 Aggiorna Totale
        </button>
        
        {/* Feedback message */}
        {feedback?.message && (
          <span style={{
            marginLeft: '1rem',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '14px',
            color: feedback.type === 'success' ? '#155724' : '#721c24',
            backgroundColor: feedback.type === 'success' ? '#d4edda' : '#f8d7da',
            border: `1px solid ${feedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {feedback.message}
          </span>
        )}
      </div>

      {/* Tabella principale */}
      <table className="tabella-rosa">
        <thead>
          <tr>
            <th>NUMERO</th>
            <th>NOME</th>
            <th>R</th>
            <th>U23</th>
            <th>SC</th>
            <th>CL</th>
            <th>FM</th>
          </tr>
        </thead>
        <tbody>
          {giocatoriPrincipali.map((giocatore) => (
            <tr key={giocatore.id} className={giocatore.numero === 'X' ? 'riga-totale' : ''}>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{giocatore.numero || '-'}</td>
              <td>
                <EditableCell
                  value={giocatore.nome}
                  field="nome"
                  giocatoreId={giocatore.id}
                  onSave={handleUpdate}
                  type="text"
                />
              </td>
              <td>{renderSelectCell(giocatore, 'ruolo', ruoloOptions)}</td>
              <td>{renderSelectCell(giocatore, 'u23', u23Options)}</td>
              <td>
                <EditableCell
                  value={giocatore.sc}
                  field="sc"
                  giocatoreId={giocatore.id}
                  onSave={handleUpdate}
                  type="text"
                />
              </td>
              <td>
                <EditableCell
                  value={giocatore.cl}
                  field="cl"
                  giocatoreId={giocatore.id}
                  onSave={handleUpdate}
                  type="number"
                />
              </td>
              <td>
                <EditableCell
                  value={giocatore.fm}
                  field="fm"
                  giocatoreId={giocatore.id}
                  onSave={handleUpdate}
                  type="number"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tabella extra */}
      {giocatoriExtra.length > 0 && (
        <div className="giocatori-extra-box">
          <h3>🎯 Giocatori Extra (29-30)</h3>
          <table className="tabella-extra">
            <thead>
              <tr>
                <th>NUMERO</th>
                <th>NOME</th>
                <th>R</th>
                <th>U23</th>
                <th>SC</th>
                <th>CL</th>
                <th>FM</th>
              </tr>
            </thead>
            <tbody>
              {giocatoriExtra.map((giocatore) => (
                <tr key={giocatore.id}>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{giocatore.numero || '-'}</td>
                  <td>
                    <EditableCell
                      value={giocatore.nome}
                      field="nome"
                      giocatoreId={giocatore.id}
                      onSave={handleUpdate}
                      type="text"
                    />
                  </td>
                  <td>{renderSelectCell(giocatore, 'ruolo', ruoloOptions)}</td>
                  <td>{renderSelectCell(giocatore, 'u23', u23Options)}</td>
                  <td>
                    <EditableCell
                      value={giocatore.sc}
                      field="sc"
                      giocatoreId={giocatore.id}
                      onSave={handleUpdate}
                      type="text"
                    />
                  </td>
                  <td>
                    <EditableCell
                      value={giocatore.cl}
                      field="cl"
                      giocatoreId={giocatore.id}
                      onSave={handleUpdate}
                      type="number"
                    />
                  </td>
                  <td>
                    <EditableCell
                      value={giocatore.fm}
                      field="fm"
                      giocatoreId={giocatore.id}
                      onSave={handleUpdate}
                      type="number"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
