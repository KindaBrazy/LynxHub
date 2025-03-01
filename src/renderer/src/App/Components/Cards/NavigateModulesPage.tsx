import {Button} from '@heroui/react';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';
import {useNavigate} from 'react-router';

import {Extensions2_Icon} from '../../../assets/icons/SvgIcons/SvgIcons1';
import {appActions} from '../../Redux/Reducer/AppReducer';
import {AppDispatch} from '../../Redux/Store';
import {modulesRoutePath} from '../Pages/SettingsPages/Modules/ModulesPage';

export default function NavigateModulesPage({size}: {size?: 'sm' | 'md'}) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleGoModules = useCallback(() => {
    dispatch(appActions.setAppState({key: 'currentPage', value: modulesRoutePath}));
    navigate(modulesRoutePath);
  }, [dispatch, navigate]);

  return (
    <Button color="primary" size={size || 'sm'} onPress={handleGoModules} startContent={<Extensions2_Icon />}>
      Modules Page
    </Button>
  );
}
