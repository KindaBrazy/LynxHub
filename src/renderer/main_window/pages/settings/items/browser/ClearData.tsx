import {Button, Checkbox, CheckboxGroup} from '@heroui/react';
import isEmpty from 'lodash/isEmpty';
import {useCallback, useState} from 'react';
import {useDispatch} from 'react-redux';

import {BroomDuo_Icon} from '../../../../../shared/assets/icons';
import {lynxTopToast} from '../../../../hooks/utils';
import rendererIpc from '../../../../ipc';
import {AppDispatch} from '../../../../redux/store';
import SettingsFilterItem from '../../SettingsFilterItem';
import SettingsSearchHighlight from '../../SettingsSearchHighlight';

export default function ClearData() {
  const dispatch = useDispatch<AppDispatch>();
  const [selected, setSelected] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const clearSelections = useCallback(async () => {
    setIsLoading(true);

    try {
      if (selected.includes('cache')) {
        await rendererIpc.browser.clearCache();
      }
      if (selected.includes('cookies')) {
        await rendererIpc.browser.clearCookies();
      }
      if (['favorites', 'history', 'fav-icons'].some(item => selected.includes(item))) {
        rendererIpc.browser.clearHistory(selected);
      }

      setTimeout(() => {
        setIsLoading(false);
        lynxTopToast(dispatch).success('Selected data cleared successfully!');
        setSelected([]);
      }, 300);
    } catch (e) {
      setIsLoading(false);
      lynxTopToast(dispatch).warning('Failed to clear data, please try again later!');
      setSelected([]);
    }
  }, [selected, dispatch]);

  return (
    <SettingsFilterItem
      searchTexts={[
        'Select browser data to clear:',
        'Clear',
        'browser data',
        'cache',
        'cookies',
        'favorites',
        'history',
        'fav icons',
        'clear data',
      ]}>
      <div className="flex flex-row justify-between items-center">
        <CheckboxGroup
          value={selected}
          className="w-fit"
          isDisabled={isLoading}
          orientation="horizontal"
          onValueChange={setSelected}
          classNames={{label: 'text-warning'}}
          label={<SettingsSearchHighlight text="Select browser data to clear:" />}>
          <Checkbox value="cache">
            <SettingsSearchHighlight text="Cache" />
          </Checkbox>
          <Checkbox value="cookies">
            <SettingsSearchHighlight text="Cookies" />
          </Checkbox>
          <Checkbox value="favorites">
            <SettingsSearchHighlight text="Favorites" />
          </Checkbox>
          <Checkbox value="history">
            <SettingsSearchHighlight text="History" />
          </Checkbox>
          <Checkbox value="fav-icons">
            <SettingsSearchHighlight text="Fav Icons" />
          </Checkbox>
        </CheckboxGroup>
        <Button
          variant="flat"
          color="warning"
          isLoading={isLoading}
          onPress={clearSelections}
          isDisabled={isEmpty(selected)}
          startContent={<BroomDuo_Icon />}>
          Clear
        </Button>
      </div>
    </SettingsFilterItem>
  );
}
