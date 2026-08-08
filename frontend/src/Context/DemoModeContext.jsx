import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const DemoModeContext = createContext(null);

export const DemoModeProvider = ({ children }) => {
  const [demoMode, setDemoMode] = useState(false);

  const toggleDemoMode = useCallback(() => {
    setDemoMode((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({
      demoMode,
      toggleDemoMode,
    }),
    [demoMode, toggleDemoMode],
  );

  return (
    <DemoModeContext.Provider value={value}>
      {children}
    </DemoModeContext.Provider>
  );
};

export const useDemoMode = () => {
  const ctx = useContext(DemoModeContext);
  if (!ctx) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return ctx;
};
