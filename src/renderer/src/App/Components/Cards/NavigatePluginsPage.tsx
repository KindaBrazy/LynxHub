import {Button} from '@heroui/react';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {PageID, PageTitles} from '../../../../../cross/CrossConstants';
import {Plugins_Icon} from '../../../assets/icons/SvgIcons/SvgIcons';
import {tabsActions} from '../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../Redux/Store';

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
