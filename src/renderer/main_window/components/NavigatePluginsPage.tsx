import {Button} from '@heroui/react';
import {PageID, PageTitles} from '@lynx_cross/consts';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {Plugins_Icon} from '../../shared/assets/icons';
import {tabsActions} from '../redux/reducers/tabs';
import {AppDispatch} from '../redux/store';

export default function NavigatePluginsPage({size}: {size?: 'sm' | 'md'}) {
  const dispatch = useDispatch<AppDispatch>();

  const handleGoModules = useCallback(() => {
    dispatch(
      tabsActions.setActivePage({
        pageID: PageID.plugins,
        title: PageTitles.plugins,
      }),
    );
  }, [dispatch]);

  return (
    <Button color="primary" size={size || 'sm'} onPress={handleGoModules} startContent={<Plugins_Icon />}>
      Plugins Page
    </Button>
  );
}
