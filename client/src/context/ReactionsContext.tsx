import React, { ReactNode, createContext, useContext, useState } from 'react';

interface ReactionsContextType {
  reactions: Record<string, number>;
  updateReactions: (uniqueId: string, index: number) => void;
}

const ReactionsContext = createContext<ReactionsContextType | undefined>(undefined);

interface ReactionsProviderProps {
  children: ReactNode;
}

const USER_REACTIONS = 'user_reactions'

export const ReactionsProvider: React.FC<ReactionsProviderProps> = ({ children }) => {
  const [reactions, setReactions] = useState<Record<string, number>>(() => {
    const storedIndexes = JSON.parse(localStorage.getItem(USER_REACTIONS) || '{}');
    return storedIndexes;
  });

  const updateReactions = (uniqueId: string, index: number) => {
    const updatedIndexes = { ...reactions, [uniqueId]: index };
    setReactions(updatedIndexes);
    localStorage.setItem(USER_REACTIONS, JSON.stringify(updatedIndexes));
  };

  return (
    <ReactionsContext.Provider value={{ reactions, updateReactions }}>
      {children}
    </ReactionsContext.Provider>
  );
};

export const useReactionContext = (): ReactionsContextType => {
  const context = useContext(ReactionsContext);
  if (!context) {
    throw new Error('useReactionContext must be used within a ReactionsProvider');
  }
  return context;
};