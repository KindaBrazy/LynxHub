import {memo} from 'react';

import NavBar from '../NavBar/NavBar';
import AppPages from './AppPages';
import ContentLoading from './ContentLoading';
import StatusBar from './StatusBar';

/** Main app contents */
const MainContents = memo(() => {
  return (
    <div className="absolute inset-0 !top-10 flex flex-col transition duration-300">
      <div className="relative flex size-full flex-row overflow-hidden">
        <NavBar />
        <ContentLoading>
          <AppPages />
        </ContentLoading>
      </div>
      <StatusBar />
    </div>
  );
});

export default MainContents;
