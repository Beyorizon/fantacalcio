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

  return (
    <div style={{ padding: '2rem', maxWidth: '100%', overflowX: 'auto' }}>
      <MiniMenu />
      <h2 style={{ marginBottom: '1.5rem' }}>Rosa di {nomeUtente}</h2>

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
              <td>{giocatore.nome || '-'}</td>
              <td>{renderSelectCell(giocatore, 'ruolo', ruoloOptions)}</td>
              <td>{renderSelectCell(giocatore, 'u23', u23Options)}</td>
              <td>{giocatore.sc || '-'}</td>
              <td>{giocatore.cl || '-'}</td>
              <td>{giocatore.fm || '-'}</td>
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
                  <td>{giocatore.nome || '-'}</td>
                  <td>{renderSelectCell(giocatore, 'ruolo', ruoloOptions)}</td>
                  <td>{renderSelectCell(giocatore, 'u23', u23Options)}</td>
                  <td>{giocatore.sc || '-'}</td>
                  <td>{giocatore.cl || '-'}</td>
                  <td>{giocatore.fm || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
