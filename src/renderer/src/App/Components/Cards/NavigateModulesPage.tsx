import {Button} from '@heroui/react';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {Extensions2_Icon} from '../../../assets/icons/SvgIcons/SvgIcons1';
import {appActions} from '../../Redux/Reducer/AppReducer';
import {tabsActions} from '../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../Redux/Store';
import {PageID} from '../../Utils/Constants';

export default function NavigateModulesPage({size}: {size?: 'sm' | 'md'}) {
  const dispatch = useDispatch<AppDispatch>();
  // const navigate = useNavigate();

  const handleGoModules = useCallback(() => {
    dispatch(appActions.setAppState({key: 'currentPage', value: PageID.modulesPageID}));
    dispatch(tabsActions.setAppState({key: 'activeTab', value: PageID.modulesPageID}));
    // navigate(modulesRoutePath); TODO
  }, [dispatch]);

  return (
    <Button color="primary" size={size || 'sm'} onPress={handleGoModules} startContent={<Extensions2_Icon />}>
      Modules Page
    </Button>
  );
}
