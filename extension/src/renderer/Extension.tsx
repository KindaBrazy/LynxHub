import './index.css';

import {Button} from '@heroui/react';

import {ExtensionRendererApi} from '../../../src/renderer/src/App/Extensions/ExtensionTypes_Renderer_Api';
import CardsAddMenu from './Components/Cards_AddMenu';
import {
  AddContentButton,
  AddSettingsButton,
  Background,
  CustomHook,
  HomePage_ReplaceCategories,
  HomePage_Top,
  HomePage_TopScroll,
  ReducerTester,
  ReplaceCards,
  StatusBarEnd,
} from './Components/Components';
import {SettingsContent, SettingsNavButton} from './Components/Settings';
import extensionReducer from './reducer';

const InvokeID = 'InvokeAI_SD';

export function InitialExtensions(lynxAPI: ExtensionRendererApi, extensionId: string) {
  return;

  function InvokeButton() {
    const onPress = () => {
      lynxAPI.setCards_TerminalPreCommands(InvokeID, ['ping 8.8.8.8 -t']);
    };

    return (
      <Button color="success" onPress={onPress} fullWidth>
        Add Command
      </Button>
    );
  }

  /** Add test button to InvokeAI installer user inputs to add terminal command
   * to run before any terminal actions in invokeAI */
  lynxAPI.events.on('card_collect_user_input', ({id, addElements}) => {
    if (id === InvokeID) addElements([InvokeButton]);
  });

  // The unique id for extension
  console.info(extensionId);

  // Listen for a card before start
  lynxAPI.events.on('before_card_start', ({id}) => {
    const targetCard = lynxAPI.modulesData?.allCards.find(card => card.id === id);
    if (targetCard) console.log(targetCard.title, 'Started');
  });

  // Listen for terminal data
  lynxAPI.rendererIpc?.pty.onData((_, id, data) => {
    console.log(id, data);
  });

  // Add new menu to the Cards
  lynxAPI.cards.customize.menu.addSection([{index: 2, components: [CardsAddMenu]}]);

  // Replace Cards Components
  lynxAPI.cards.replace(ReplaceCards);

  // Add custom reducer to app
  lynxAPI.addReducer([{name: 'extension', reducer: extensionReducer}]);
  lynxAPI.customizePages.audio.add.scrollBottom(ReducerTester);

  // Add new pages
  lynxAPI.navBar.addButton.contentBar(AddContentButton);
  lynxAPI.navBar.addButton.settingsBar(AddSettingsButton);

  // Customize existing pages
  lynxAPI.customizePages.settings.add.navButton(SettingsNavButton);
  lynxAPI.customizePages.settings.add.content(SettingsContent);
  lynxAPI.customizePages.home.replace.categories(HomePage_ReplaceCategories);
  lynxAPI.customizePages.home.add.top(HomePage_Top);
  lynxAPI.customizePages.home.add.scrollBottom(HomePage_TopScroll);

  // Add elements to status bar
  lynxAPI.statusBar.addEnd(StatusBarEnd);

  // Add custom hooks
  lynxAPI.addCustomHook(CustomHook);

  // Change background
  lynxAPI.replaceBackground(Background);
}
