import Background from '@lynx/components/Background';
import AppHooks from '@lynx/hooks/index';
import MainContents from '@lynx/layouts/MainContents';
import TitleBar from '@lynx/layouts/titleBar';
import ExtensionHooks from '@lynx/plugins/extensions/Hooks';

import Modals from './components/modals';
import Initializer from './components/modals/app/WelcomeModal';
import ToastProviders from './layouts/ToastProviders';

/**
 * Root renderer application layout for the main window.
 */
export default function App() {
  return (
    <>
      <AppHooks />
      <Initializer />
      <ExtensionHooks />
      <Background />
      <TitleBar />
      <MainContents />
      <ToastProviders />
      <Modals />
    </>
  );
}
