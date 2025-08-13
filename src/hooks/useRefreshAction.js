import { createContext, useContext, useState } from 'react';

const RefreshActionContext = createContext(null);

export function RefreshActionProvider({ children }) {
  const [refreshAction, setRefreshAction] = useState(null);

  const setRefreshActionForPage = (action) => {
    setRefreshAction(action);
  };

  const clearRefreshAction = () => {
    setRefreshAction(null);
  };

  return (
    <RefreshActionContext.Provider value={{ 
      refreshAction, 
      setRefreshActionForPage, 
      clearRefreshAction 
    }}>
      {children}
    </RefreshActionContext.Provider>
  );
}

export const useRefreshAction = () => useContext(RefreshActionContext);
