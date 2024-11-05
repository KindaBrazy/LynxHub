import {Provider as ReduxProvider} from 'react-redux';

import App from './App/App';
import ModulesProvider from './App/Modules/ModulesContext';
import {createStore} from './App/Redux/Store';

export default function Layout() {
  return (
    <ReduxProvider store={createStore()}>
      <ModulesProvider>
        <App />
      </ModulesProvider>
    </ReduxProvider>
  );
}
