import '../../shared/styles.css';

import {createRoot} from 'react-dom/client';

import rendererIpc from '../../main_window/services/RendererIpc';
import LiquidChromeLoading from './loadings/LiquidChrome';
import RippleLoading from './loadings/Ripple';
import SimpleLoading from './loadings/Simple';
import ThreadsLoading from './loadings/Threads';

rendererIpc.others.disableLoadingAnimations().then(disableLoadingAnimations => {
  let TargetComponent = SimpleLoading;

  if (!disableLoadingAnimations) {
    const components = [ThreadsLoading, LiquidChromeLoading, RippleLoading];
    const randomIndex = Math.floor(Math.random() * components.length);
    TargetComponent = components[randomIndex];
  }

  createRoot(document.getElementById('root') as HTMLElement).render(<TargetComponent />);
});
