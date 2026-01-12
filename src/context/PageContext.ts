import { createContext } from 'react';
import type { PageContextType } from '../types/page.types';

export const PageContext = createContext<PageContextType | undefined>(undefined);
