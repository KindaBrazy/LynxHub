import {Overlay} from '@mantine/core';

import {useSettingsState} from '../../../../../../../Redux/App/SettingsReducer';
import ConfigCardCompactMode from './ConfigCard-CompactMode';
import ConfigCardDesc from './ConfigCard-Desc';
import ConfigCardDevImage from './ConfigCard-DevImage';
import ConfigCardDevName from './ConfigCard-DevName';
import ConfigCardRepoInfo from './ConfigCard-RepoInfo';

export default function ConfigCard() {
  const compactMode = useSettingsState('cardsCompactMode');

  return (
    <>
      <ConfigCardCompactMode />
      <div className="relative mt-8 space-y-4">
        {compactMode && (
          <Overlay blur={2} className="content-center !overflow-hidden !rounded-lg">
            <span className="rounded-md bg-foreground/10 p-4 text-small font-semibold">
              Disable Compact Mode to Edit
            </span>
          </Overlay>
        )}
        <ConfigCardDevImage />
        <ConfigCardDevName />
        <ConfigCardDesc />
        <ConfigCardRepoInfo />
      </div>
    </>
  );
}
