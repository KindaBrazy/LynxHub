import Background from '@lynx/components/Background';
import AppHooks from '@lynx/hooks/index';
import Hooks from '@lynx/hooks/index';
import MainContents from '@lynx/layouts/MainContents';
import Modals from '@lynx/layouts/modals';
import Initializer from '@lynx/layouts/modals/app_welcome';
import TitleBar from '@lynx/layouts/title_bar';

import UIProviders from './contexts/UIProviders';

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
