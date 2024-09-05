import {useEffect} from 'react';

import {APP_NAME} from '../../../../cross/CrossConstants';
import {useAppState} from '../Redux/App/AppReducer';
import rendererIpc from '../RendererIpc';

const CONNECT_SRC =
  'https://github.com/ ' +
  'https://api.github.com/ ' +
  'https://*.githubusercontent.com/ ' +
  'https://image.civitai.com/ ' +
  `${import.meta.env.DEV && 'ws://localhost:5173/'}`;

/** HTML attributes and document title */
export default function useHtmlAttributes() {
  const darkMode = useAppState('darkMode');

  useEffect(() => {
    // Set HTML attributes based on dark mode
    document.documentElement.className = `select-none text-foreground bg-background overflow-hidden 
    ${darkMode ? 'dark' : 'light'}`;

    // Set the document title
    document.title = APP_NAME;

    async function setPolicy() {
      const moduleData = await rendererIpc.module.getModulesData();

      const port = new URL(moduleData[0]).port;

      // Set Content Security Policy (CSP)
      const csp = [
        "default-src 'self';",
        "script-src 'self';",
        `script-src-elem 'self' http://localhost:${port};`,
        "style-src 'self' 'unsafe-inline';",
        `img-src 'self' data: ${CONNECT_SRC};`,
        'frame-src *;',
        `connect-src ${CONNECT_SRC};`,
      ].join(' ');

      const metaCSP = document.createElement('meta');
      metaCSP.httpEquiv = 'Content-Security-Policy';
      metaCSP.content = csp;

      // Remove any existing CSP and add the new one
      const existingMetaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (existingMetaCSP) {
        existingMetaCSP.parentNode?.removeChild(existingMetaCSP);
      }

      document.head.appendChild(metaCSP);
    }

    setPolicy();
  }, [darkMode]);
}
