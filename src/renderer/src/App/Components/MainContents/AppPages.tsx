import {AnimatePresence} from 'framer-motion';
import {useMemo} from 'react';

import {extensionsData} from '../../Extensions/ExtensionLoader';
import {useCardsState} from '../../Redux/Reducer/CardsReducer';
import {PageID} from '../../Utils/Constants';
import AudioGenerationPage from '../Pages/ContentPages/AudioGenerationPage';
import GamesPage from '../Pages/ContentPages/GamesPage';
import HomePage from '../Pages/ContentPages/Home/HomePage';
import ImageGenerationPage from '../Pages/ContentPages/ImageGenerationPage';
import TextGenerationPage from '../Pages/ContentPages/TextGenerationPage';
import ToolsPage from '../Pages/ContentPages/ToolsPage';
import DashboardPage from '../Pages/SettingsPages/Dashboard/DashboardPage';
import ExtensionsPage from '../Pages/SettingsPages/Extensions/ExtensionsPage';
import ModulesPage from '../Pages/SettingsPages/Modules/ModulesPage';
import SettingsPage from '../Pages/SettingsPages/Settings/SettingsPage';
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
      {activeTab === PageID.homePageID && <HomePage />}
      {activeTab === PageID.imageGenPageID && <ImageGenerationPage />}
      {activeTab === PageID.textGenPageID && <TextGenerationPage />}
      {activeTab === PageID.audioGenPageID && <AudioGenerationPage />}

      {activeTab === PageID.toolsPageID && <ToolsPage />}
      {activeTab === PageID.gamesPageID && <GamesPage />}

      {activeTab === PageID.dashboardPageID && <DashboardPage />}
      {activeTab === PageID.modulesPageID && <ModulesPage />}
      {activeTab === PageID.extensionsPageID && <ExtensionsPage />}
      {activeTab === PageID.settingsPageID && <SettingsPage />}
    </AnimatePresence>
  );
}
