import {Button} from '@heroui/react';
import {tabsActions} from '@lynx/redux/reducers/tabs';
import {AppDispatch} from '@lynx/redux/store';
import {PageID, PageTitles} from '@lynx_common/consts';
import {WidgetAdd} from '@solar-icons/react-perf/BoldDuotone';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

/**
 * A button that navigates to the Plugins page when clicked.
 */
export default function NavigateToPluginsButton({size}: {size?: 'sm' | 'md'}) {
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
    <Button color="primary" size={size || 'sm'} onPress={handleGoModules} startContent={<WidgetAdd />}>
      Plugins Page
    </Button>
  );
}
