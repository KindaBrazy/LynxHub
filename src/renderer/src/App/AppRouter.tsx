import {compact, isNull} from 'lodash';
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

export async function initRouter(importedExtensions: ExtensionImport[]) {
  let extRoutes: RouteObject[] = [];
  for (const importedExtension of importedExtensions) {
    const pages = compact(importedExtension.RoutePage);
    extRoutes = [...extRoutes, ...pages];
  }

  const pages = compact(importedExtensions.map(ext => ext.Pages));
  const [homePage] = compact(pages.map(page => page.HomePage));
  const [imageGenerationPage] = compact(pages.map(page => page.ImageGenerationPage));
  const [textGenerationPage] = compact(pages.map(page => page.TextGenerationPage));
  const [audioGenerationPage] = compact(pages.map(page => page.AudioGenerationPage));
  const [modulesPage] = compact(pages.map(page => page.ModulesPage));
  const [settingsPage] = compact(pages.map(page => page.SettingsPage));
  const [dashboardPage] = compact(pages.map(page => page.DashboardPage));

  const childRoutes: RouteObject[] = [
    {
      Component: isNull(homePage) ? HomePage : homePage,
      errorElement: <RouterPagesError />,
      path: homeRoutePath,
    },
    {
      Component: isNull(imageGenerationPage) ? ImageGenerationPage : imageGenerationPage,
      errorElement: <RouterPagesError />,
      path: imageGenRoutePath,
    },
    {
      Component: isNull(textGenerationPage) ? TextGenerationPage : textGenerationPage,
      errorElement: <RouterPagesError />,
      path: textGenRoutePath,
    },
    {
      Component: isNull(audioGenerationPage) ? AudioGenerationPage : audioGenerationPage,
      errorElement: <RouterPagesError />,
      path: audioGenRoutePath,
    },

    {
      Component: isNull(modulesPage) ? ModulesPage : modulesPage,
      errorElement: <RouterPagesError />,
      path: modulesRoutePath,
    },
    {
      Component: isNull(settingsPage) ? SettingsPage : settingsPage,
      errorElement: <RouterPagesError />,
      path: settingsRoutePath,
    },
    {
      Component: isNull(dashboardPage) ? DashboardPage : dashboardPage,
      errorElement: <RouterPagesError />,
      path: dashboardRoutePath,
    },
  ];

  const mainRoute: RouteObject[] = [
    {
      Component: Layout,
      errorElement: <RouterMainError />,
      children: compact([...childRoutes, ...extRoutes]),
    },
  ];

  return createMemoryRouter(mainRoute, {initialEntries: [homeRoutePath]});
}
