import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useParams } from 'react-router-dom';
import MiniMenu from '../components/MiniMenu';

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

      // Se è stata modificata la colonna CL, ricalcola il totale
      if (column === 'cl') {
        await updateCLTotal();
      }

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

  // Funzione per calcolare e aggiornare il totale CL
  const updateCLTotal = async () => {
    try {
      // Recupera tutti i giocatori dell'utente (escluso TOTALE)
      const { data: giocatori, error: fetchError } = await supabase
        .from('giocatori')
        .select('cl')
        .eq('utente', utenteId)
        .neq('numero', 'TOTALE');

      if (fetchError) {
        console.error('Errore nel recupero dei giocatori per il calcolo:', fetchError);
        return;
      }

      // Calcola la somma dei valori CL (escludendo valori null, undefined o non numerici)
      const totaleCL = giocatori.reduce((sum, giocatore) => {
        const valoreCL = parseFloat(giocatore.cl);
        return isNaN(valoreCL) ? sum : sum + valoreCL;
      }, 0);

      // Arrotonda a 2 decimali
      const totaleCLArrotondato = Math.round(totaleCL * 100) / 100;

      // Aggiorna la riga TOTALE
      const { error: updateError } = await supabase
        .from('giocatori')
        .update({ cl: totaleCLArrotondato.toString() })
        .eq('utente', utenteId)
        .eq('numero', 'TOTALE');

      if (updateError) {
        console.error('Errore nell\'aggiornamento del totale CL:', updateError);
      } else {
        console.log('Totale CL aggiornato:', totaleCLArrotondato);
      }

    } catch (error) {
      console.error('Errore nel calcolo del totale CL:', error);
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
          <option value="POR">POR</option>
          <option value="DIF">DIF</option>
          <option value="CEN">CEN</option>
          <option value="ATT">ATT</option>
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
          
          @media screen and (max-width: 768px) {
            .rosa-container {
              padding: 1rem 0.5rem !important;
            }
          }
          
          @media screen and (max-width: 480px) {
            .rosa-container {
              padding: 0.5rem 0.25rem !important;
            }
          }
        `}
      </style>
      
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
          {rosaOrdinata.map((giocatore, index) => (
            <tr key={index}>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{giocatore.numero || '-'}</td>
              <td className="nome-giocatore">{giocatore.nome}</td>
              <td>{renderRoleCell(giocatore, index)}</td>
              <td>{renderCell(giocatore, index, 'sc')}</td>
              <td>{renderCell(giocatore, index, 'cl')}</td>
              <td>{renderCell(giocatore, index, 'fm')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
