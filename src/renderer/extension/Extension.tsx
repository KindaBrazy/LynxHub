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
} from './Components/Components';
import {SettingsContent, SettingsNavButton} from './Components/Settings';
import extensionReducer from './reducer';

export function InitialExtensions(lynxAPI: ExtensionRendererApi) {
  return;

  lynxAPI.customizePages.settings.add.navButton(SettingsNavButton);
  lynxAPI.customizePages.settings.add.content(SettingsContent);
  lynxAPI.customizePages.home.replace.categories(HomePage_ReplaceCategories);
  lynxAPI.customizePages.home.add.top(HomePage_Top);
  lynxAPI.customizePages.home.add.scrollBottom(HomePage_TopScroll);
  lynxAPI.customizePages.audio.add.scrollBottom(ReducerTester);

  lynxAPI.statusBar.addEnd(StatusBarEnd);

  lynxAPI.router.add(routePage);

  lynxAPI.navBar.addButton.contentBar(AddContentButton);
  lynxAPI.navBar.addButton.settingsBar(AddSettingsButton);

  lynxAPI.addCustomHook(CustomHook);

  lynxAPI.replaceBackground(Background);

  lynxAPI.addReducer([{name: 'extension', reducer: extensionReducer}]);
}
