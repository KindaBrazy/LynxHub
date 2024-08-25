import {createMemoryRouter, RouteObject} from 'react-router-dom';

import Layout from '../Layout';
import AudioGenerationPage, {audioGenRoutePath} from './Components/Pages/ContentPages/AudioGenerationPage';
import HomePage, {homeRoutePath} from './Components/Pages/ContentPages/Home/HomePage';
import ImageGenerationPage, {imageGenRoutePath} from './Components/Pages/ContentPages/ImageGenerationPage';
import TextGenerationPage, {textGenRoutePath} from './Components/Pages/ContentPages/TextGenerationPage';
import RouterMainError from './Components/Pages/RouterMainError';
import RouterPagesError from './Components/Pages/RouterPagesError';
import ModulesPage, {modulesRoutePath} from './Components/Pages/SettingsPages/Modules/ModulesPage';
import SettingsPage, {settingsRoutePath} from './Components/Pages/SettingsPages/Settings/SettingsPage';

const routes: RouteObject[] = [
  {
    Component: Layout,
    errorElement: <RouterMainError />,
    children: [
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
    ],
  },
];

export async function initRouter() {
  return createMemoryRouter(routes, {initialEntries: [homeRoutePath]});
}
