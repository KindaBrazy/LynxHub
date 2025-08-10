import {Button, Checkbox, CheckboxGroup} from '@heroui/react';
import isEmpty from 'lodash/isEmpty';
import {useCallback, useState} from 'react';
import {useDispatch} from 'react-redux';

import {BroomDuo_Icon} from '../../../../../../../assets/icons/SvgIcons/SvgIcons';
import {AppDispatch} from '../../../../../../Redux/Store';
import rendererIpc from '../../../../../../RendererIpc';
import {lynxTopToast} from '../../../../../../Utils/UtilHooks';

export default function SettingsBrowser_ClearData() {
  const dispatch = useDispatch<AppDispatch>();
  const [selected, setSelected] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const clearCache = () => {
    rendererIpc.browser.clearCache();
  };

  const clearCookies = () => {
    rendererIpc.browser.clearCookies();
  };

  const clearSelections = useCallback(() => {
    setIsLoading(true);

    if (selected.includes('cache')) clearCache();
    if (selected.includes('cookies')) clearCookies();
    if (['favorites', 'history', 'fav-icons'].some(item => selected.includes(item))) {
      rendererIpc.browser.clearHistory(selected);
    }

    setTimeout(() => {
      setIsLoading(false);
      lynxTopToast(dispatch).success('Selected data cleared successfully!');
    }, 300);
  }, [selected, dispatch]);

  return (
    <div className="flex flex-row justify-between items-center">
      <CheckboxGroup
        value={selected}
        className="w-fit"
        isDisabled={isLoading}
        orientation="horizontal"
        onValueChange={setSelected}
        classNames={{label: 'text-warning'}}
        label={'Select browser data to clear:'}>
        <Checkbox value="cache">Cache</Checkbox>
        <Checkbox value="cookies">Cookies</Checkbox>
        <Checkbox value="favorites">Favorites</Checkbox>
        <Checkbox value="history">History</Checkbox>
        <Checkbox value="fav-icons">Fav Icons</Checkbox>
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
  );
}
