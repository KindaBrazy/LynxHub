import useAppEvents from './AppEvents/AppEvents';
import useStateChange from './AppEvents/AppStates';
import Background from './Components/Background';
import MainContents from './Components/MainContents/MainContents';
import Modals from './Components/Modals/Modals';
import TitleBar from './Components/TitleBar/TitleBar';
import ExtensionHooks from './ExtensionHooks';
import UIProviders from './UIProviders';
import useRegisterHotkeys from './Utils/RegisterHotkeys';
import useHtmlAttributes from './Utils/SetHtmlAttributes';

export default function App() {
  useHtmlAttributes();
  useRegisterHotkeys();
  useAppEvents();
  useStateChange();

  return (
    <UIProviders>
      <ExtensionHooks />
      <Background />
      <TitleBar />
      <MainContents />
      <Modals />
    </UIProviders>
  );
}
