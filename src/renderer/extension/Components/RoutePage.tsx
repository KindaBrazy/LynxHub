import {RouteObject} from 'react-router-dom';

import RouterPagesError from '../../src/App/Components/Pages/RouterPagesError';

function ComponentContent() {
  return (
    <div className="flex size-full items-center justify-center text-large">
      I&#39;m a text from extension router page
    </div>
  );
}

function ComponentSetting() {
  return null;
}

const routePage: RouteObject[] = [
  {
    Component: ComponentContent,
    errorElement: <RouterPagesError />,
    path: 'extContentPath',
  },
  {
    Component: ComponentSetting,
    errorElement: <RouterPagesError />,
    path: 'extSettingPath',
  },
];

export default routePage;
