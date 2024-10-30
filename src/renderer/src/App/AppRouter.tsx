import compact from 'lodash/compact';
import {createMemoryRouter, RouteObject} from 'react-router-dom';

import {ExtensionImport} from '../../../cross/ExtensionTypes';
import Layout from '../Layout';
import AudioGenerationPage, {audioGenRoutePath} from './Components/Pages/ContentPages/AudioGenerationPage';
import HomePage, {homeRoutePath} from './Components/Pages/ContentPages/Home/HomePage';
import ImageGenerationPage, {imageGenRoutePath} from './Components/Pages/ContentPages/ImageGenerationPage';
import TextGenerationPage, {textGenRoutePath} from './Components/Pages/ContentPages/TextGenerationPage';
import RouterMainError from './Components/Pages/RouterMainError';
import RouterPagesError from './Components/Pages/RouterPagesError';
import DashboardPage, {dashboardRoutePath} from './Components/Pages/SettingsPages/Dashboard/DashboardPage';
import ModulesPage, {modulesRoutePath} from './Components/Pages/SettingsPages/Modules/ModulesPage';
import SettingsPage, {settingsRoutePath} from './Components/Pages/SettingsPages/Settings/SettingsPage';

const childRoutes: RouteObject[] = [
  {
    Component: HomePage,
    errorElement: <RouterPagesError />,
    path: homeRoutePath,
  },
  {
    Component: ImageGenerationPage,
    errorElement: <RouterPagesError />,
    path: imageGenRoutePath,
  },
  {
    Component: TextGenerationPage,
    errorElement: <RouterPagesError />,
    path: textGenRoutePath,
  },
  {
    Component: AudioGenerationPage,
    errorElement: <RouterPagesError />,
    path: audioGenRoutePath,
  },

  {
    Component: ModulesPage,
    errorElement: <RouterPagesError />,
    path: modulesRoutePath,
  },
  {
    Component: SettingsPage,
    errorElement: <RouterPagesError />,
    path: settingsRoutePath,
  },
  {
    Component: DashboardPage,
    errorElement: <RouterPagesError />,
    path: dashboardRoutePath,
  },
];

export async function initRouter(importedExtensions: ExtensionImport[]) {
  let extRoutes: RouteObject[] = [];
  for (const importedExtension of importedExtensions) {
    const pages = compact(importedExtension.RoutePage);
    extRoutes = [...extRoutes, ...pages];
  }

  const mainRoute: RouteObject[] = [
    {
      Component: Layout,
      errorElement: <RouterMainError />,
      children: compact([...childRoutes, ...extRoutes]),
    },
  ];

  return createMemoryRouter(mainRoute, {initialEntries: [homeRoutePath]});
}
