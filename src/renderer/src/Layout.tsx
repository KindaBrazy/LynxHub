import ModulesProvider from '@renderer/App/Modules/ModulesContext';
import {Provider as ReduxProvider} from 'react-redux';

import App from './App/App';
import {store} from './App/Redux/Store';

export default function Layout() {
  return (
    <ReduxProvider store={store}>
      <ModulesProvider>
        <App />
      </ModulesProvider>
    </ReduxProvider>
  );
}
