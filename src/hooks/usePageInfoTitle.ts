import type { UsePageTitleOptions } from "../types/page.types";
import { usePageContext } from './usePageContext';
import { useEffect } from "react";

export const usePageTitle = ({
  title,
  subtitle,
  breadcrumbs,
  documentTitle,
  metaDescription,
}: UsePageTitleOptions) => {
  const { setPageInfo } = usePageContext();

  useEffect(() => {
    // Actualiza el contexto de la página
    setPageInfo({ title, subtitle, breadcrumbs });
    
    // Actualiza el título del documento (navegador)
    document.title = `${documentTitle || title} | CloudDocs Copilot`;
    
    // Actualiza meta description
    if (metaDescription) {
      let metaTag = document.querySelector('meta[name="description"]') as HTMLMetaElement;
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('name', 'description');
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', metaDescription);
    }
  }, [title, subtitle, breadcrumbs, documentTitle, metaDescription, setPageInfo]);
};