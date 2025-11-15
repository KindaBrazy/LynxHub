import {Skeleton} from '@heroui/react';
import {useEffect, useState} from 'react';

import LynxScroll from '../../../Reusable/LynxScroll';
import {SettingsSections} from './SettingsContainer';

type Props = {searchValue: string; sectionTexts: Map<string, string>};

/** Settings content */
const SettingsPageContents = ({searchValue, sectionTexts}: Props) => {
  const [showSections, setShowSections] = useState(false);

  useEffect(() => {
    let frameId = 0;
    const timeoutId = window.setTimeout(() => {
      frameId = window.requestAnimationFrame(() => {
        setShowSections(true);
      });
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <LynxScroll className="size-full pl-1 pr-4">
      <div className="flex flex-col gap-y-4">
        {!showSections && (
          <div className="flex flex-col gap-y-4">
            <Skeleton className="w-full h-64 rounded-xl" />
            <Skeleton className="w-full h-64 rounded-xl" />
          </div>
        )}
        {showSections && <SettingsSections searchValue={searchValue} sectionTexts={sectionTexts} />}
      </div>
    </LynxScroll>
  );
};

export default SettingsPageContents;
