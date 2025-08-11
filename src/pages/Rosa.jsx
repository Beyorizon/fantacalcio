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
    const fetchDati = async () => {
      const { data: giocatori, error: erroreGiocatori } = await supabase
        .from('giocatori')
        .select('*')
        .eq('utente', utenteId);

      if (!erroreGiocatori) {
        setRosa(giocatori);
      }

      const { data: utente, error: erroreUtente } = await supabase
        .from('utenti')
        .select('nome')
        .eq('nome', utenteId)
        .single();

      if (!erroreUtente && utente) {
        setNomeUtente(utente.nome);
      }
    };

    fetchDati();
  }, [utenteId]);

  const rosaOrdinata = [...rosa].sort((a, b) => {
    const ordine = ['P1', 'P2', ...Array.from({ length: 28 }, (_, i) => String(i + 1)), 'X'];
    const indexA = ordine.indexOf(a.numero);
    const indexB = ordine.indexOf(b.numero);
    return indexA - indexB;
  });

  const giocatoriPrincipali = rosaOrdinata.filter(g =>
    ['P1', 'P2', ...Array.from({ length: 28 }, (_, i) => String(i + 1)), 'X'].includes(g.numero)
  );

  const giocatoriExtra = rosaOrdinata.filter(g => g.numero === '29' || g.numero === '30');

  const handleCellClick = (rowIndex, column, currentValue) => {
    setEditingCell({ rowIndex, column });
    setEditValue(currentValue?.toString() || '');
  };

  const handleSave = async () => {
    if (!editingCell) return;

    const { rowIndex, column } = editingCell;
    const giocatore = rosaOrdinata[rowIndex];

    try {
      const { error } = await supabase
        .from('giocatori')
        .update({ [column]: editValue })
        .eq('id', giocatore.id);

      if (!error) {
        const { data: aggiornato } = await supabase
          .from('giocatori')
          .select('*')
          .eq('utente', utenteId);

        setRosa(aggiornato);
        setFeedback({ rowIndex, column, message: 'Salvato', type: 'success' });
        setTimeout(() => setFeedback(null), 2000);
      }
    } catch (err) {
      setFeedback({ rowIndex, column, message: 'Errore', type: 'error' });
      setTimeout(() => setFeedback(null), 2000);
    }

    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSave();
    else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
    }
  };

  const handleBlur = () => handleSave();

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
          onKeyPress={handleKeyPress}
          onBlur={handleBlur}
          autoFocus
          style={{ width: '60px', padding: '4px', fontSize: '14px' }}
        />
      );
    }

    return (
      <span
        onClick={() => handleCellClick(rowIndex, column, currentValue)}
        style={{ cursor: 'pointer', display: 'inline-block', minWidth: '50px' }}
      >
        {currentValue || '-'}
        {hasFeedback && (
          <span style={{ fontSize: '12px', marginLeft: '4px', color: feedback.type === 'success' ? 'green' : 'red' }}>
            {feedback.message}
          </span>
        )}
      </span>
    );
  };

  const renderNomeCell = (giocatore, rowIndex) => renderCell(giocatore, rowIndex, 'nome');

  const renderRoleCell = (giocatore, rowIndex) => {
    return (
      <select
        value={giocatore.ruolo || ""}
        onChange={(e) => handleRoleChange(giocatore.id, e.target.value)}
        style={{ padding: '4px', fontSize: '14px', minWidth: '80px' }}
      >
        <option value="">-</option>
        {ruoloOptions.map((ruolo) => (
          <option key={ruolo} value={ruolo}>
            {ruolo}
          </option>
        ))}
      </select>
    );
  };

  const handleRoleChange = async (giocatoreId, nuovoRuolo) => {
    const { error } = await supabase
      .from('giocatori')
      .update({ ruolo: nuovoRuolo })
      .eq('id', giocatoreId);

    if (!error) {
      setRosa(prev =>
        prev.map(g => g.id === giocatoreId ? { ...g, ruolo: nuovoRuolo } : g)
      );
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <MiniMenu />
      <h2>Rosa di {nomeUtente}</h2>

      {/* TABELLA PRINCIPALE */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
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
          {giocatoriPrincipali.map((g, i) => (
            <tr key={i} style={g.numero === 'X' ? { fontWeight: 'bold', background: '#eef' } : {}}>
              <td>{g.numero}</td>
              <td>{renderNomeCell(g, i)}</td>
              <td>{renderRoleCell(g, i)}</td>
              <td>{renderCell(g, i, 'sc')}</td>
              <td>{renderCell(g, i, 'cl')}</td>
              <td>{renderCell(g, i, 'fm')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* BLOCCO EXTRA */}
      {giocatoriExtra.length > 0 && (
        <div style={{
          backgroundColor: '#f4f4f4',
          padding: '1rem',
          borderRadius: '12px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>🎯 Giocatori Extra</h3>
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
              {giocatoriExtra.map((g, i) => (
                <tr key={`extra-${i}`}>
                  <td>{g.numero}</td>
                  <td>{renderNomeCell(g, `extra-${i}`)}</td>
                  <td>{renderRoleCell(g, `extra-${i}`)}</td>
                  <td>{renderCell(g, `extra-${i}`, 'sc')}</td>
                  <td>{renderCell(g, `extra-${i}`, 'cl')}</td>
                  <td>{renderCell(g, `extra-${i}`, 'fm')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}