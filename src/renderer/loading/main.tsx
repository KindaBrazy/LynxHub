import './index.css';

import {createRoot} from 'react-dom/client';

import rendererIpc from '../src/App/RendererIpc';
import LiquidChromeLoading from './Loadings/LiquidChromeLoading';
import SimpleLoading from './Loadings/SimpleLoading';
import ThreadsLoading from './Loadings/ThreadsLoading';

rendererIpc.storage.get('app').then(({disableLoadingAnimations}) => {
  let TargetComponent = SimpleLoading;

  if (!disableLoadingAnimations) {
    const components = [ThreadsLoading, LiquidChromeLoading];
    const randomIndex = Math.floor(Math.random() * components.length);
    TargetComponent = components[randomIndex];
  }

  createRoot(document.getElementById('root') as HTMLElement).render(<TargetComponent />);
});
