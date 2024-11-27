import {compact, isNil} from 'lodash';
import {createMemoryRouter, RouteObject} from 'react-router';

import Layout from '../Layout';
import AudioGenerationPage, {audioGenRoutePath} from './Components/Pages/ContentPages/AudioGenerationPage';
import GamesPage, {gamesRoutePath} from './Components/Pages/ContentPages/GamesPage';
import HomePage, {homeRoutePath} from './Components/Pages/ContentPages/Home/HomePage';
import ImageGenerationPage, {imageGenRoutePath} from './Components/Pages/ContentPages/ImageGenerationPage';
import TextGenerationPage, {textGenRoutePath} from './Components/Pages/ContentPages/TextGenerationPage';
import ToolsPage, {toolsRoutePath} from './Components/Pages/ContentPages/ToolsPage';
import RouterMainError from './Components/Pages/RouterMainError';
import RouterPagesError from './Components/Pages/RouterPagesError';
import DashboardPage, {dashboardRoutePath} from './Components/Pages/SettingsPages/Dashboard/DashboardPage';
import ExtensionsPage, {extensionsRoutePath} from './Components/Pages/SettingsPages/Extensions/ExtensionsPage';
import ModulesPage, {modulesRoutePath} from './Components/Pages/SettingsPages/Modules/ModulesPage';
import SettingsPage, {settingsRoutePath} from './Components/Pages/SettingsPages/Settings/SettingsPage';
import {extensionsData} from './Extensions/ExtensionLoader';

export async function initRouter() {
  const {
    homePage,
    imageGenerationPage,
    audioGenerationPage,
    textGenerationPage,
    modulesPage,
    settingsPage,
    dashboardPage,
    toolsPage,
    extensionsPage,
  } = extensionsData.router.replace;

  const childRoutes: RouteObject[] = [
    {
      Component: isNil(homePage) ? HomePage : homePage,
      errorElement: <RouterPagesError />,
      path: homeRoutePath,
    },
    {
      Component: isNil(imageGenerationPage) ? ImageGenerationPage : imageGenerationPage,
      errorElement: <RouterPagesError />,
      path: imageGenRoutePath,
    },
    {
      Component: isNil(textGenerationPage) ? TextGenerationPage : textGenerationPage,
      errorElement: <RouterPagesError />,
      path: textGenRoutePath,
    },
    {
      Component: isNil(audioGenerationPage) ? AudioGenerationPage : audioGenerationPage,
      errorElement: <RouterPagesError />,
      path: audioGenRoutePath,
    },
    {
      Component: isNil(toolsPage) ? ToolsPage : toolsPage,
      errorElement: <RouterPagesError />,
      path: toolsRoutePath,
    },
    {
      Component: GamesPage,
      errorElement: <RouterPagesError />,
      path: gamesRoutePath,
    },

    {
      Component: isNil(modulesPage) ? ModulesPage : modulesPage,
      errorElement: <RouterPagesError />,
      path: modulesRoutePath,
    },
    {
      Component: isNil(settingsPage) ? SettingsPage : settingsPage,
      errorElement: <RouterPagesError />,
      path: settingsRoutePath,
    },
    {
      Component: isNil(extensionsPage) ? ExtensionsPage : extensionsPage,
      errorElement: <RouterPagesError />,
      path: extensionsRoutePath,
    },
    {
      Component: isNil(dashboardPage) ? DashboardPage : dashboardPage,
      errorElement: <RouterPagesError />,
      path: dashboardRoutePath,
    },
  ];

  const mainRoute: RouteObject[] = [
    {
      Component: Layout,
      errorElement: <RouterMainError />,
      children: compact([...childRoutes, ...extensionsData.router.add]),
    },
  ];

  return createMemoryRouter(mainRoute, {initialEntries: [homeRoutePath]});
}
