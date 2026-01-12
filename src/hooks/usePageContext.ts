import { useContext } from 'react';
import { PageContext } from '../context/PageContext';

export const usePageContext = () => {
  const context = useContext(PageContext);
  if (!context) throw new Error('usePageContext must be used within PageProvider');
  return context;
};
