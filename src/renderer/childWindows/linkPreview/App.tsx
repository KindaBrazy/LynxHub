import {useDocumentDarkMode} from '@lynx_shared/hooks';
import browserIpc from '@lynx_shared/ipc/browser';
import {useEffect, useLayoutEffect, useRef, useState} from 'react';

/**
 * LinkPreview component.
 * Displays a preview tooltip when hovering over links.
 * Resizes the window based on the content width.
 */
export default function LinkPreview() {
  const [url, setUrl] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Apply dark mode class to document
  useDocumentDarkMode('bg-transparent');

  // Listen for link hover events
  useEffect(() => {
    // When a link is hovered, update the URL

    return browserIpc.on.linkHover(setUrl);
  }, []);

  // Resize the window when the URL changes and content is rendered
  // Using useLayoutEffect to ensure measurements are done before paint if possible,
  // though for IPC window resizing, the effect is similar to useEffect but slightly faster in timing relative to render.
  useLayoutEffect(() => {
    if (containerRef.current && url) {
      // Calculate width based on content width + padding
      const width = Math.min(containerRef.current.scrollWidth + 20, 800);
      browserIpc.send.resizeLinkPreview(width);
    }
  }, [url]);

  if (!url) return null;

  return (
    <div
      className={
        'inline-block px-2 py-0.5 text-xs truncate rounded-lg bg-white/95 dark:bg-[#1a1a1a]/95' +
        ' border border-l-0 border-b-0 border-gray-200 dark:border-gray-700 text-gray-700' +
        ' dark:text-gray-300 backdrop-blur-sm whitespace-nowrap'
      }
      ref={containerRef}
      style={{maxWidth: '800px'}}>
      {url}
    </div>
  );
}
