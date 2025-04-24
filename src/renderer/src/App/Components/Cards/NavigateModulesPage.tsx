import {Button} from '@heroui/react';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {Extensions2_Icon} from '../../../assets/icons/SvgIcons/SvgIcons1';
import {tabsActions} from '../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../Redux/Store';
import {PageID} from '../../Utils/Constants';

export default function NavigateModulesPage({size}: {size?: 'sm' | 'md'}) {
  const dispatch = useDispatch<AppDispatch>();

  const handleGoModules = useCallback(() => {
    dispatch(
      tabsActions.setActivePage({
        pageID: PageID.modules,
        title: 'Modules',
        isTerminal: false,
        favIcon: {show: false, targetUrl: ''},
      }),
    );
  }, [dispatch]);

  return (
    <Button color="primary" size={size || 'sm'} onPress={handleGoModules} startContent={<Extensions2_Icon />}>
      Modules Page
    </Button>
  );
}
