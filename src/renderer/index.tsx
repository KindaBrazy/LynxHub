import {createRoot} from 'react-dom/client';
import App from './Components/App';

const container: HTMLElement = document.getElementById('root') as HTMLElement;
createRoot(container).render(<App />);
