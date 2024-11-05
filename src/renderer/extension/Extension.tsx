import './index.css';

import {ExtensionRendererApi} from '../src/App/Extensions/ExtensionTypes';
import {
  AddContentButton,
  AddSettingsButton,
  Background,
  CustomHook,
  HomePage_ReplaceCategories,
  HomePage_Top,
  HomePage_TopScroll,
  ReducerTester,
  routePage,
  StatusBarEnd,
} from './Components';
import extensionReducer from './reducer';

export function InitialExtensions(lynxAPI: ExtensionRendererApi) {
  return;

  lynxAPI.statusBar.addEnd(StatusBarEnd);
  lynxAPI.router.add(routePage);
  lynxAPI.navBar.addButton.contentBar(AddContentButton);
  lynxAPI.navBar.addButton.settingsBar(AddSettingsButton);
  lynxAPI.addCustomHook(CustomHook);
  lynxAPI.replaceBackground(Background);
  lynxAPI.customizePages.home.replace.categories(HomePage_ReplaceCategories);
  lynxAPI.customizePages.home.add.top(HomePage_Top);
  lynxAPI.customizePages.home.add.scrollBottom(HomePage_TopScroll);

  lynxAPI.customizePages.audio.add.scrollBottom(ReducerTester);
  lynxAPI.addReducer([{name: 'extension', reducer: extensionReducer}]);
}
