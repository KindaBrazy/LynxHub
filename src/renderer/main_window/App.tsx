import Background from './components/Background';
import UIProviders from './contexts/UIProviders';
import AppHooks from './hooks';
import MainContents from './layouts/MainContents';
import Modals from './layouts/modals';
import Initializer from './layouts/modals/app_welcome';
import TitleBar from './layouts/title_bar';
import Hooks from './plugins/extensions/Hooks';

export default function App() {
  return (
    <UIProviders>
      <AppHooks />
      <Initializer />
      <Hooks />
      <Background />
      <TitleBar />
      <MainContents />
      <Modals />
    </UIProviders>
  );
}
