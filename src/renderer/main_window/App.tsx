import Background from '@lynx/components/Background';
import AppHooks from '@lynx/hooks/index';
import MainContents from '@lynx/layouts/MainContents';
import Modals from '@lynx/layouts/modals';
import Initializer from '@lynx/layouts/modals/appWelcome';
import TitleBar from '@lynx/layouts/titleBar';
import ExtensionHooks from '@lynx/plugins/extensions/Hooks';

import UIProviders from './contexts/UIProviders';

export default function App() {
  return (
    <UIProviders>
      <AppHooks />
      <Initializer />
      <ExtensionHooks />
      <Background />
      <TitleBar />
      <MainContents />
      <Modals />
    </UIProviders>
  );
}
