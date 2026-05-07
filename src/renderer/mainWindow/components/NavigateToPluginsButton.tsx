import {Button, ButtonProps} from '@heroui/react';
import {tabsActions} from '@lynx/redux/reducers/tabs';
import {AppDispatch} from '@lynx/redux/store';
import {PluginPage_Icon} from '@lynx_assets/icons/pages';
import {PageID, PageTitles} from '@lynx_common/consts';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

/**
 * A button that navigates to the Plugins page when clicked.
 */
export default function NavigateToPluginsButton({size, className}: {size?: ButtonProps['size']; className?: string}) {
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
    <Button size={size} className={className} onPress={handleGoModules}>
      <PluginPage_Icon />
      Plugins Page
    </Button>
  );
}
