import type { ReactNode } from 'react';

export interface PageInfo {
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; path?: string }>;
  actions?: ReactNode;
}

export interface PageContextType {
  pageInfo: PageInfo;
  setPageInfo: (info: PageInfo) => void;
}

export interface UsePageTitleOptions {
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; path?: string }>;
  documentTitle?: string;
  metaDescription?: string;
  ogImage?: string;
}