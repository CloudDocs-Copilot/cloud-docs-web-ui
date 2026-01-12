import { type ReactNode, useState } from 'react';
import type { PageInfo } from '../types/page.types';
import { PageContext } from './PageContext';

export function PageProvider({ children }: { children: ReactNode }) {
  const [pageInfo, setPageInfo] = useState<PageInfo>({ title: '' });
  
  return (
    <PageContext.Provider value={{ pageInfo, setPageInfo }}>
      {children}
    </PageContext.Provider>
  );
}
