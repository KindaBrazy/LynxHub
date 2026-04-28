import '@lynx_shared/styles.css';

import applicationIpc from '@lynx_shared/ipc/application';
import {createRoot} from 'react-dom/client';

import LightPillarLoading from './loadings/LightPillar';
import LiquidChromeLoading from './loadings/LiquidChrome';
import PlasmaLoading from './loadings/Plasma';
import RippleLoading from './loadings/Ripple';
import SimpleLoading from './loadings/Simple';
import ThreadsLoading from './loadings/Threads';

/**
 * Initializes the loading screen.
 * It checks if loading animations are disabled and selects a random animation component accordingly.
 */
applicationIpc.invoke.disableLoadingAnimations().then(isDisabled => {
  let TargetComponent = SimpleLoading;

  if (!isDisabled) {
    const components = [ThreadsLoading, LiquidChromeLoading, RippleLoading, LightPillarLoading, PlasmaLoading];
    const randomIndex = Math.floor(Math.random() * components.length);
    TargetComponent = components[randomIndex];
  }

  createRoot(document.getElementById('root') as HTMLElement).render(<TargetComponent />);
});
