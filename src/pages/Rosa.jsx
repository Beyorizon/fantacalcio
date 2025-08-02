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

export default function Rosa() {
  const { utenteId } = useParams();
  const [rosa, setRosa] = useState([]);
  const [nomeUtente, setNomeUtente] = useState('');
  const [editingCell, setEditingCell] = useState(null); // { rowIndex, column }
  const [editValue, setEditValue] = useState('');
  const [feedback, setFeedback] = useState(null); // { rowIndex, column, message, type }

  useEffect(() => {
    const fetchDati = async () => {
      // 1. Recupera i giocatori dell'utente
      const { data: giocatori, error: erroreGiocatori } = await supabase
        .from('giocatori')
        .select('*')
        .eq('utente', utenteId);

      if (erroreGiocatori) {
        console.error('Errore nel recupero dei giocatori:', erroreGiocatori);
      } else {
        setRosa(giocatori);
      }

      // 2. Recupera il nome dell'utente
      const { data: utente, error: erroreUtente } = await supabase
      .from('utenti')
      .select('nome')
      .eq('nome', utenteId) // usa 'nome' invece di 'id'
      .single();
    

      if (erroreUtente) {
        console.error('Errore nel recupero del nome utente:', erroreUtente);
      } else if (utente) {
        setNomeUtente(utente.nome);
      }
    };

    fetchDati();
  }, [utenteId]);

  // Funzione per ordinare i giocatori secondo la sequenza specifica
  const rosaOrdinata = [...rosa].sort((a, b) => {
    const ordine = ["P1", "P2", "N", ...Array.from({ length: 28 }, (_, i) => String(i + 1))];
    const indexA = ordine.indexOf(a.numero);
    const indexB = ordine.indexOf(b.numero);
    
    // Se entrambi i numeri sono nella sequenza, ordina per posizione
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    
    // Se solo uno è nella sequenza, quello va prima
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    
    // Se nessuno è nella sequenza, mantieni l'ordine originale
    return 0;
  });

  // Suddivisione dei giocatori in gruppi
  const giocatoriNormali = rosaOrdinata.filter(giocatore => {
    const numero = parseInt(giocatore.numero);
    return numero >= 1 && numero <= 28;
  });

  const giocatoriExtra = rosaOrdinata.filter(giocatore => {
    const numero = parseInt(giocatore.numero);
    return numero > 28;
  });

  const totale = rosaOrdinata.find(giocatore => giocatore.numero === 'TOTALE');

  const handleCellClick = (rowIndex, column, currentValue) => {
    setEditingCell({ rowIndex, column });
    setEditValue(currentValue?.toString() || '');
  };

  const handleSave = async () => {
    if (!editingCell) return;

    const { rowIndex, column } = editingCell;
    const giocatore = rosaOrdinata[rowIndex]; // Usa rosaOrdinata invece di rosa

    try {
      const { error } = await supabase
        .from('giocatori')
        .update({ [column]: editValue })
        .eq('id', giocatore.id);

      if (error) {
        throw error;
      }

      // Se è stata modificata la colonna CL, il trigger PostgreSQL si occuperà automaticamente del totale
      // Non serve più chiamare manualmente la funzione JavaScript

      // Show success feedback
      setFeedback({
        rowIndex,
        column,
        message: 'Salvato',
        type: 'success'
      });

      // Reload data
      const { data: giocatori, error: erroreGiocatori } = await supabase
        .from('giocatori')
        .select('*')
        .eq('utente', utenteId);

      if (!erroreGiocatori) {
        setRosa(giocatori);
      }

      // Clear feedback after 2 seconds
      setTimeout(() => {
        setFeedback(null);
      }, 2000);

    } catch (error) {
      console.error('Errore nel salvataggio:', error);
      
      // Show error feedback
      setFeedback({
        rowIndex,
        column,
        message: 'Errore',
        type: 'error'
      });

      // Clear feedback after 2 seconds
      setTimeout(() => {
        setFeedback(null);
      }, 2000);
    }

    setEditingCell(null);
    setEditValue('');
  };

  // Funzione per chiamare manualmente il ricalcolo del totale (opzionale)
  const handleClChange = async (id, nuovoCl, utente) => {
    try {
      // 1. Aggiorna il valore cl del singolo giocatore
      const { error: updateError } = await supabase
        .from('giocatori')
        .update({ cl: nuovoCl })
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      // 2. Chiama la funzione Postgres per ricalcolare il totale
      const { error: rpcError } = await supabase.rpc('aggiorna_totale_utente', { 
        user_id: utente 
      });

      if (rpcError) {
        console.error('Errore nel ricalcolo del totale:', rpcError);
      }

      // 3. Ricarica i dati per mostrare il totale aggiornato
      const { data: giocatori, error: fetchError } = await supabase
        .from('giocatori')
        .select('*')
        .eq('utente', utenteId);

      if (!fetchError) {
        setRosa(giocatori);
      }

    } catch (error) {
      console.error('Errore nell\'aggiornamento CL:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  const renderCell = (giocatore, rowIndex, column) => {
    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.column === column;
    const currentValue = giocatore[column];
    const hasFeedback = feedback?.rowIndex === rowIndex && feedback?.column === column;

    if (isEditing) {
      return (
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyPress={handleKeyPress}
            onBlur={handleBlur}
            autoFocus
            style={{
              width: '60px',
              padding: '4px',
              border: '1px solid #007bff',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>
      );
    }

    return (
      <div style={{ position: 'relative' }}>
        <span
          onClick={() => handleCellClick(rowIndex, column, currentValue)}
          style={{
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
            display: 'inline-block',
            minWidth: '40px',
            textAlign: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#f8f9fa';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          {currentValue || '-'}
        </span>
        {hasFeedback && (
          <span
            style={{
              position: 'absolute',
              top: '-20px',
              right: '-10px',
              fontSize: '12px',
              color: feedback.type === 'success' ? '#28a745' : '#dc3545',
              fontWeight: 'bold',
              animation: 'fadeInOut 2s ease-in-out'
            }}
          >
            {feedback.type === 'success' ? '✅ ' : '❌ '}{feedback.message}
          </span>
        )}
      </div>
    );
  };

  const renderNomeCell = (giocatore, rowIndex) => {
    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.column === 'nome';
    const currentValue = giocatore.nome;
    const hasFeedback = feedback?.rowIndex === rowIndex && feedback?.column === 'nome';

    if (isEditing) {
      return (
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyPress={handleKeyPress}
            onBlur={handleBlur}
            autoFocus
            style={{
              width: '120px',
              padding: '4px',
              border: '1px solid #007bff',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>
      );
    }

    return (
      <div style={{ position: 'relative' }}>
        <span
          onClick={() => handleCellClick(rowIndex, 'nome', currentValue)}
          style={{
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
            display: 'inline-block',
            fontWeight: 'bold'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#f8f9fa';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          {currentValue || '-'}
        </span>
        {hasFeedback && (
          <span
            style={{
              position: 'absolute',
              top: '-20px',
              right: '-10px',
              fontSize: '12px',
              color: feedback.type === 'success' ? '#28a745' : '#dc3545',
              fontWeight: 'bold',
              animation: 'fadeInOut 2s ease-in-out'
            }}
          >
            {feedback.type === 'success' ? '✅ ' : '❌ '}{feedback.message}
          </span>
        )}
      </div>
    );
  };

  const renderRoleCell = (giocatore, rowIndex) => {
    const hasFeedback = feedback?.rowIndex === rowIndex && feedback?.column === 'ruolo';

    return (
      <div style={{ position: 'relative' }}>
        <select 
          value={giocatore.ruolo || ""} 
          onChange={(e) => handleRoleChange(giocatore.id, e.target.value)}
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
          <option value="">-</option>
          {ruoloOptions.map((ruolo) => (
            <option key={ruolo} value={ruolo}>
              {ruolo}
            </option>
          ))}
        </select>
        {hasFeedback && (
          <span
            style={{
              position: 'absolute',
              top: '-20px',
              right: '-10px',
              fontSize: '12px',
              color: feedback.type === 'success' ? '#28a745' : '#dc3545',
              fontWeight: 'bold',
              animation: 'fadeInOut 2s ease-in-out'
            }}
          >
            {feedback.type === 'success' ? '✅ ' : '❌ '}{feedback.message}
          </span>
        )}
      </div>
    );
  };

  const handleRoleChange = async (giocatoreId, nuovoRuolo) => {
    try {
      const { error } = await supabase
        .from('giocatori')
        .update({ ruolo: nuovoRuolo })
        .eq('id', giocatoreId);

      if (error) {
        throw error;
      }

      // Aggiorna lo stato locale
      setRosa(prev => 
        prev.map(giocatore => 
          giocatore.id === giocatoreId 
            ? { ...giocatore, ruolo: nuovoRuolo }
            : giocatore
        )
      );

      // Mostra feedback di successo
      setFeedback({
        rowIndex: rosaOrdinata.findIndex(g => g.id === giocatoreId),
        column: 'ruolo',
        message: 'Salvato',
        type: 'success'
      });

      // Clear feedback after 2 seconds
      setTimeout(() => {
        setFeedback(null);
      }, 2000);

    } catch (error) {
      console.error('Errore nel salvataggio del ruolo:', error);
      
      // Show error feedback
      setFeedback({
        rowIndex: rosaOrdinata.findIndex(g => g.id === giocatoreId),
        column: 'ruolo',
        message: 'Errore',
        type: 'error'
      });

      // Clear feedback after 2 seconds
      setTimeout(() => {
        setFeedback(null);
      }, 2000);
    }
  };

  return (
    <div style={{ 
      padding: '2rem',
      maxWidth: '100%',
      overflowX: 'auto'
    }}>
      <MiniMenu />
      <h2 style={{ marginBottom: '1.5rem' }}>Rosa di {nomeUtente}</h2>
      
      <style>
        {`
          @keyframes fadeInOut {
            0% { opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { opacity: 0; }
          }
          
          .tabella-rosa {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            border-collapse: collapse;
            font-weight: 500;
            background: #fff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            table-layout: fixed;
          }

          .tabella-rosa th,
          .tabella-rosa td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid #eee;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }

          .tabella-rosa th {
            background-color: #f2f2f2;
            font-weight: 700;
            font-size: 0.9rem;
            text-transform: uppercase;
            color: #333;
          }

          .tabella-rosa tr:last-child td {
            border-bottom: none;
          }

          .tabella-rosa tr:hover {
            background-color: #f9fafb;
          }

          .nome-giocatore {
            font-weight: 700;
          }

          .riga-totale {
            border-top: 2px solid #007bff !important;
            background-color: #f8f9fa !important;
            font-weight: bold;
          }

          .riga-totale:hover {
            background-color: #e9ecef !important;
          }

          .box-extra {
            margin-top: 2rem;
            padding: 1.5rem;
            background-color: #f8f9fa;
            border-radius: 12px;
            border: 1px solid #dee2e6;
          }

          .box-extra h3 {
            margin: 0 0 1rem 0;
            color: #495057;
            font-size: 1.1rem;
            font-weight: 600;
          }

          .tabella-extra {
            width: 100%;
            border-collapse: collapse;
            background: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .tabella-extra th,
          .tabella-extra td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid #eee;
            font-size: 0.9rem;
          }

          .tabella-extra th {
            background-color: #e9ecef;
            font-weight: 600;
            font-size: 0.8rem;
            text-transform: uppercase;
            color: #495057;
          }

          .tabella-extra tr:hover {
            background-color: #f1f3f4;
          }
          
          @media screen and (max-width: 768px) {
            .rosa-container {
              padding: 1rem 0.5rem !important;
            }
            
            .box-extra {
              margin-top: 1.5rem;
              padding: 1rem;
            }
            
            .box-extra h3 {
              font-size: 1rem;
            }
          }
          
          @media screen and (max-width: 480px) {
            .rosa-container {
              padding: 0.5rem 0.25rem !important;
            }
            
            .box-extra {
              margin-top: 1rem;
              padding: 0.75rem;
            }
          }
        `}
      </style>
      
      {/* Tabella principale con giocatori normali */}
      <table className="tabella-rosa">
        <thead>
          <tr>
            <th style={{ padding: '12px 8px' }}>
              NUMERO
            </th>
            <th style={{ padding: '12px 8px' }}>
              NOME
            </th>
            <th style={{ padding: '12px 8px' }}>
              R
            </th>
            <th style={{ padding: '12px 8px' }}>
              SC
            </th>
            <th style={{ padding: '12px 8px' }}>
              CL
            </th>
            <th style={{ padding: '12px 8px' }}>
              FM
            </th>
          </tr>
        </thead>
        <tbody>
          {giocatoriNormali.map((giocatore, index) => (
            <tr key={index}>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{giocatore.numero || '-'}</td>
              <td>{renderNomeCell(giocatore, index)}</td>
              <td>{renderRoleCell(giocatore, index)}</td>
              <td>{renderCell(giocatore, index, 'sc')}</td>
              <td>{renderCell(giocatore, index, 'cl')}</td>
              <td>{renderCell(giocatore, index, 'fm')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Riga TOTALE */}
      {totale && (
        <table className="tabella-rosa" style={{ marginTop: '1rem' }}>
          <tbody>
            <tr className="riga-totale">
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{totale.numero}</td>
              <td style={{ fontWeight: 'bold' }}>{totale.nome}</td>
              <td>{totale.ruolo}</td>
              <td>{totale.sc || '-'}</td>
              <td style={{ fontWeight: 'bold', color: '#007bff' }}>{totale.cl || '-'}</td>
              <td>{totale.fm || '-'}</td>
            </tr>
          </tbody>
        </table>
      )}

      {/* Sezione giocatori extra */}
      {giocatoriExtra.length > 0 && (
        <div className="box-extra">
          <h3>🎯 Giocatori Extra (oltre 28)</h3>
          <table className="tabella-extra">
            <thead>
              <tr>
                <th>NUMERO</th>
                <th>NOME</th>
                <th>R</th>
                <th>SC</th>
                <th>CL</th>
                <th>FM</th>
              </tr>
            </thead>
            <tbody>
              {giocatoriExtra.map((giocatore, index) => (
                <tr key={`extra-${index}`}>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{giocatore.numero || '-'}</td>
                  <td>{renderNomeCell(giocatore, `extra-${index}`)}</td>
                  <td>{renderRoleCell(giocatore, `extra-${index}`)}</td>
                  <td>{renderCell(giocatore, `extra-${index}`, 'sc')}</td>
                  <td>{renderCell(giocatore, `extra-${index}`, 'cl')}</td>
                  <td>{renderCell(giocatore, `extra-${index}`, 'fm')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
