import {AnimatePresence} from 'framer-motion';
import {useMemo} from 'react';

import {extensionsData} from '../../Extensions/ExtensionLoader';
import {useCardsState} from '../../Redux/Reducer/CardsReducer';
import {useTabsState} from '../../Redux/Reducer/TabsReducer';
import AudioGenerationPage, {audioGenPageID} from '../Pages/ContentPages/AudioGenerationPage';
import GamesPage, {gamesPageID} from '../Pages/ContentPages/GamesPage';
import HomePage, {homePageID} from '../Pages/ContentPages/Home/HomePage';
import ImageGenerationPage, {imageGenPageID} from '../Pages/ContentPages/ImageGenerationPage';
import TextGenerationPage, {textGenPageID} from '../Pages/ContentPages/TextGenerationPage';
import ToolsPage, {toolsPageID} from '../Pages/ContentPages/ToolsPage';
import DashboardPage, {dashboardPageID} from '../Pages/SettingsPages/Dashboard/DashboardPage';
import ExtensionsPage, {extensionsPageID} from '../Pages/SettingsPages/Extensions/ExtensionsPage';
import ModulesPage, {modulesPageID} from '../Pages/SettingsPages/Modules/ModulesPage';
import SettingsPage, {settingsPageID} from '../Pages/SettingsPages/Settings/SettingsPage';
import RunningCardView from '../RunningCardView/RunningCardView';

export default function AppPages() {
  const {isRunning} = useCardsState('runningCard');
  const activeTab = useTabsState('activeTab');

  const Container = useMemo(() => extensionsData.runningAI.container, []);

  return isRunning ? (
    Container ? (
      <Container />
    ) : (
      <RunningCardView />
    )
  ) : (
    <AnimatePresence>
      {activeTab === homePageID && <HomePage />}
      {activeTab === imageGenPageID && <ImageGenerationPage />}
      {activeTab === textGenPageID && <TextGenerationPage />}
      {activeTab === audioGenPageID && <AudioGenerationPage />}

      {activeTab === toolsPageID && <ToolsPage />}
      {activeTab === gamesPageID && <GamesPage />}

      {activeTab === dashboardPageID && <DashboardPage />}
      {activeTab === modulesPageID && <ModulesPage />}
      {activeTab === extensionsPageID && <ExtensionsPage />}
      {activeTab === settingsPageID && <SettingsPage />}
    </AnimatePresence>
  );
}
