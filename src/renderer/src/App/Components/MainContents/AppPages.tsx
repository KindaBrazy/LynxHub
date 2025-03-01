import {AnimatePresence} from 'framer-motion';
import {useMemo} from 'react';

import {extensionsData} from '../../Extensions/ExtensionLoader';
import {useCardsState} from '../../Redux/Reducer/CardsReducer';
import {useActivePage} from '../../Redux/Reducer/TabsReducer';
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
  const activePage = useActivePage();

  const Container = useMemo(() => extensionsData.runningAI.container, []);

  return isRunning ? (
    Container ? (
      <Container />
    ) : (
      <RunningCardView />
    )
  ) : (
    <AnimatePresence>
      {activePage === PageID.homePageID && <HomePage />}
      {activePage === PageID.imageGenPageID && <ImageGenerationPage />}
      {activePage === PageID.textGenPageID && <TextGenerationPage />}
      {activePage === PageID.audioGenPageID && <AudioGenerationPage />}

      {activePage === PageID.toolsPageID && <ToolsPage />}
      {activePage === PageID.gamesPageID && <GamesPage />}

      {activePage === PageID.dashboardPageID && <DashboardPage />}
      {activePage === PageID.modulesPageID && <ModulesPage />}
      {activePage === PageID.extensionsPageID && <ExtensionsPage />}
      {activePage === PageID.settingsPageID && <SettingsPage />}
    </AnimatePresence>
  );
}
