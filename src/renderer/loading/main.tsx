import './index.css';

import {createRoot} from 'react-dom/client';

import LiquidChromeLoading from './Loadings/LiquidChromeLoading';
import OrbLoading from './Loadings/OrbLoading';
import ThreadsLoading from './Loadings/ThreadsLoading';

const loadings = [
  {component: <OrbLoading />, weight: 100},
  {component: <ThreadsLoading />, weight: 100},
  {component: <LiquidChromeLoading />, weight: 20},
];

const totalWeight = loadings.reduce((sum, loading) => sum + loading.weight, 0);

const randomNumber = Math.random() * totalWeight;

let selectedLoading = loadings[0].component;
let cumulativeWeight = 0;

for (const loading of loadings) {
  cumulativeWeight += loading.weight;
  if (randomNumber < cumulativeWeight) {
    selectedLoading = loading.component;
    break;
  }
}

createRoot(document.getElementById('root') as HTMLElement).render(selectedLoading);
