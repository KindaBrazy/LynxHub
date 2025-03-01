import {useSettingsState} from '../../../../../../../../Redux/Reducer/SettingsReducer';
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
      <div className="relative mt-8 space-y-4 px-4 pb-4">
        {compactMode && (
          <div className="content-center absolute inset-0 !overflow-hidden !rounded-lg z-20 bg-black/50 ">
            <span className="rounded-md bg-black/70 p-4 text-small font-semibold text-white ">
              Disable Compact Mode to Edit
            </span>
          </div>
        )}
        <ConfigCardDevImage />
        <ConfigCardDevName />
        <ConfigCardDesc />
        <ConfigCardRepoInfo />
      </div>
    </>
  );
}
