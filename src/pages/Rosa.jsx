import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useParams } from 'react-router-dom';
import MiniMenu from '../components/MiniMenu';

const ruoloOptions = [
  "Por", "DC", "DD E", "DS E", "DC DS E", "DD DS E", "DC DS", "DC DD",
  "B DS E", "B DD E", "E", "EW", "EM", "EC",
  "M", "MC", "C", "CT", "CW", "CWT",
  "T", "W", "WT", "WA", "TA", "A", "Pc"
];

export default function Rosa() {
  const { utenteId } = useParams();
  const [rosa, setRosa] = useState([]);
  const [nomeUtente, setNomeUtente] = useState('');
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: giocatori } = await supabase
        .from('giocatori')
        .select('*')
        .eq('utente', utenteId);

      const { data: utente } = await supabase
        .from('utenti')
        .select('nome')
        .eq('nome', utenteId)
        .single();

      if (giocatori) setRosa(giocatori);
      if (utente) setNomeUtente(utente.nome);
    };

    fetchData();
  }, [utenteId]);

  const ordinePersonalizzato = ["P1", "P2", ...Array.from({ length: 28 }, (_, i) => `${i + 1}`), "TOTALE"];
  const rosaOrdinata = [...rosa].sort((a, b) => {
    const indexA = ordinePersonalizzato.indexOf(a.numero);
    const indexB = ordinePersonalizzato.indexOf(b.numero);
    return indexA - indexB;
  });

  const principali = rosaOrdinata.filter(g => g.numero === 'P1' || g.numero === 'P2' || (parseInt(g.numero) >= 1 && parseInt(g.numero) <= 28) || g.numero === 'TOTALE');
  const extra = rosa.filter(g => parseInt(g.numero) === 29 || parseInt(g.numero) === 30);
    const handleCellClick = (rowIndex, column, currentValue) => {
    setEditingCell({ rowIndex, column });
    setEditValue(currentValue?.toString() || '');
  };

  const handleSave = async () => {
    if (!editingCell) return;

    const { rowIndex, column } = editingCell;
    const giocatore = [...principali, ...extra][rowIndex];

    const { error } = await supabase
      .from('giocatori')
      .update({ [column]: editValue })
      .eq('id', giocatore.id);

    if (!error) {
      const { data: aggiornati } = await supabase
        .from('giocatori')
        .select('*')
        .eq('utente', utenteId);
      setRosa(aggiornati);
    }

    setFeedback({ rowIndex, column, message: error ? 'Errore' : 'Salvato', type: error ? 'error' : 'success' });

    setTimeout(() => setFeedback(null), 2000);
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
    }
  };

  const renderCell = (giocatore, rowIndex, column) => {
    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.column === column;
    const currentValue = giocatore[column];
    const hasFeedback = feedback?.rowIndex === rowIndex && feedback?.column === column;

    if (isEditing) {
      return (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyPress}
          onBlur={handleSave}
          autoFocus
          style={{ width: '60px', padding: '4px' }}
        />
      );
    }

    return (
      <div onClick={() => handleCellClick(rowIndex, column, currentValue)} style={{ cursor: 'pointer' }}>
        {currentValue || '-'}
        {hasFeedback && (
          <span style={{ color: feedback.type === 'success' ? 'green' : 'red', marginLeft: 5 }}>
            {feedback.message}
          </span>
        )}
      </div>
    );
  };

  const renderSelect = (giocatore, rowIndex) => (
    <select
      value={giocatore.ruolo || ''}
      onChange={async (e) => {
        const ruolo = e.target.value;
        await supabase
          .from('giocatori')
          .update({ ruolo })
          .eq('id', giocatore.id);

        const aggiornati = rosa.map(g => g.id === giocatore.id ? { ...g, ruolo } : g);
        setRosa(aggiornati);
      }}
    >
      <option value="">-</option>
      {ruoloOptions.map(r => (
        <option key={r} value={r}>{r}</option>
      ))}
    </select>
  );
    return (
    <div style={{ padding: '2rem', maxWidth: '100%', overflowX: 'auto' }}>
      <MiniMenu />
      <h2>Rosa di {nomeUtente}</h2>

      {/* Box Principale: P1, P2, 1...28, Totale */}
      <div style={{
        border: '1px solid #ccc',
        borderRadius: '10px',
        padding: '1rem',
        marginBottom: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        backgroundColor: '#fff'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Numero</th>
              <th>Nome</th>
              <th>R</th>
              <th>SC</th>
              <th>CL</th>
              <th>FM</th>
            </tr>
          </thead>
          <tbody>
            {principali.map((g, i) => (
              <tr key={g.id} style={g.numero === 'TOTALE' ? {
                borderTop: '2px solid #007bff',
                background: '#f8f9fa',
                fontWeight: 'bold'
              } : {}}>
                <td>{g.numero || '-'}</td>
                <td>{renderCell(g, i, 'nome')}</td>
                <td>{renderSelect(g, i)}</td>
                <td>{renderCell(g, i, 'sc')}</td>
                <td>{renderCell(g, i, 'cl')}</td>
                <td>{renderCell(g, i, 'fm')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Box Secondario: 29, 30 */}
      {extra.length > 0 && (
        <div style={{
          border: '1px solid #999',
          borderRadius: '10px',
          padding: '1rem',
          backgroundColor: '#f5f5f5'
        }}>
          <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>Giocatori Extra (29-30)</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Numero</th>
                <th>Nome</th>
                <th>R</th>
                <th>SC</th>
                <th>CL</th>
                <th>FM</th>
              </tr>
            </thead>
            <tbody>
              {extra.map((g, i) => (
                <tr key={g.id}>
                  <td>{g.numero || '-'}</td>
                  <td>{renderCell(g, principali.length + i, 'nome')}</td>
                  <td>{renderSelect(g, principali.length + i)}</td>
                  <td>{renderCell(g, principali.length + i, 'sc')}</td>
                  <td>{renderCell(g, principali.length + i, 'cl')}</td>
                  <td>{renderCell(g, principali.length + i, 'fm')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
