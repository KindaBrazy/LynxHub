import {Provider as ReduxProvider} from 'react-redux';

import App from './App/App';
import {createStore} from './App/Redux/Store';

export default function Layout() {
  return (
    <ReduxProvider store={createStore()}>
      <App />
    </ReduxProvider>
  );
}
