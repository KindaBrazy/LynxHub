import Background from './Components/Background';
import Initializer from './Components/Init/Initializer';
import MainContents from './Components/MainContents/MainContents';
import Modals from './Components/Modals/Modals';
import TitleBar from './Components/TitleBar/TitleBar';
import ExtensionHooks from './ExtensionHooks';
import AppHooks from './MainHooks';
import UIProviders from './UIProviders';

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
