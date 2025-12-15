import {PropsWithChildren, useMemo} from 'react';

import {searchInStrings} from '../../../../Utils/UtilFunctions';
import {useSettingsSearchQuery} from './SettingsSearchQueryContext';

type Props = PropsWithChildren<{
  searchTexts: (string | undefined)[];
}>;

const SettingsFilterItem = ({searchTexts, children}: Props) => {
  const searchValue = useSettingsSearchQuery();

  const visible = useMemo(() => {
    if (!searchValue) return true;
    return searchInStrings(searchValue, searchTexts);
  }, [searchTexts, searchValue]);

  if (!visible) {
    return null;
  }

  return <div className="contents">{children}</div>;
};

export default SettingsFilterItem;
