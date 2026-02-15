import {useSettingsState} from '@lynx/redux/reducers/settings';
import {searchInStrings} from '@lynx/utils';
import {PropsWithChildren, useMemo} from 'react';

type Props = PropsWithChildren<{
  searchTexts: (string | undefined)[];
}>;

const SettingsFilterItem = ({searchTexts, children}: Props) => {
  const searchValue = useSettingsState('searchValue');

  const visible = useMemo(() => {
    if (!searchValue) return true;
    return searchInStrings(searchValue, searchTexts);
  }, [searchTexts, searchValue]);

  if (!visible) {
    return null;
  }

  return <div className="contents">{children}</div>;
};

export function canSettingItemShow(searchValue: string, searchTexts: (string | undefined)[]) {
  if (!searchValue) return true;
  return searchInStrings(searchValue, searchTexts);
}

export default SettingsFilterItem;
