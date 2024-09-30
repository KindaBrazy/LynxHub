import useAppEvents from './AppEvents';
import Background from './Components/Background';
import MainContents from './Components/MainContents';
import Modals from './Components/Modals/Modals';
import TitleBar from './Components/TitleBar/TitleBar';
import UIProviders from './UIProviders';
import useRegisterHotkeys from './Utils/RegisterHotkeys';
import useHtmlAttributes from './Utils/SetHtmlAttributes';

export default function App() {
  //#region Hooks

  useHtmlAttributes();
  useRegisterHotkeys();
  useAppEvents();
  //#endregion

  return (
    <UIProviders>
      <Background />
      <TitleBar />
      <MainContents />
      <Modals />
    </UIProviders>
  );
}
