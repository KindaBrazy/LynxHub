import {useEffect, useRef, useState} from 'react';

import {browserChannels} from '../../cross/IpcChannelAndTypes';
import rendererIpc from '../src/App/RendererIpc';

const ipc = window.electron.ipcRenderer;

export default function LinkPreview() {
  const [url, setUrl] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const offHover = ipc.on(browserChannels.onLinkHover, (_: any, newUrl: string) => {
      setUrl(newUrl || '');
    });

    rendererIpc.win.onDarkMode((_, darkMode) => {
      document.documentElement.className = `${darkMode === 'dark' ? 'dark' : 'light'} bg-transparent`;
    });
    rendererIpc.storage.get('app').then(({darkMode}) => {
      document.documentElement.className = `${darkMode === 'dark' ? 'dark' : 'light'} bg-transparent`;
    });

    return () => offHover();
  }, []);

  // Send resize when URL changes
  useEffect(() => {
    if (containerRef.current && url) {
      const width = Math.min(containerRef.current.scrollWidth + 20, 800);
      ipc.send(browserChannels.resizeLinkPreview, width);
    }
  }, [url]);

  if (!url) return null;

  return (
    <div
      className={
        'inline-block px-2 py-0.5 text-xs truncate rounded-lg ' +
        'bg-white/95 dark:bg-[#1a1a1a]/95 border border-l-0 border-b-0 ' +
        'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 ' +
        'backdrop-blur-sm whitespace-nowrap'
      }
      ref={containerRef}
      style={{maxWidth: '800px'}}>
      {url}
    </div>
  );
}
